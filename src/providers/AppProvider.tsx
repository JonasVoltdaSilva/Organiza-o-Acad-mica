import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { MOODLE_BASE_URL, SUAP_BASE_URL } from "../config/integrations";
import {
  cancelReminders,
  scheduleOverdueReminder,
  scheduleReminders,
  setupNotificationChannel,
} from "../services/notifications";
import {
  fetchMoodleAssignments,
  fetchMoodleCourses,
  fetchMoodleSiteInfo,
  loginMoodleViaSSO,
} from "../services/moodle";
import {
  fetchSuapBoletim,
  fetchSuapHorario,
  fetchSuapMeusDados,
  loginSuap,
} from "../services/suap";
import { emptyData, loadData, saveData } from "../services/storage";
import {
  AbsenceEntry,
  Activity,
  AppData,
  Assessment,
  Discipline,
  Exam,
  Note,
  ScheduleSlot,
  Settings,
  StudySession,
} from "../types";
import { DEFAULT_MAX_GRADE, DEFAULT_PASSING_GRADE } from "../constants";
import { disciplineColors, disciplineIcons } from "../theme/palette";

interface AppContextValue {
  state: AppData;
  ready: boolean;
  upsertDiscipline: (discipline: Discipline) => void;
  deleteDiscipline: (id: string) => void;
  upsertActivity: (activity: Activity) => Promise<void>;
  toggleActivityCompleted: (id: string) => Promise<void>;
  deleteActivity: (id: string) => void;
  upsertExam: (exam: Exam) => Promise<void>;
  deleteExam: (id: string) => void;
  upsertNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  upsertAssessment: (assessment: Assessment) => void;
  deleteAssessment: (id: string) => void;
  addAbsence: (absence: AbsenceEntry) => void;
  deleteAbsence: (id: string) => void;
  addStudySession: (session: StudySession) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  connectMoodle: () => Promise<void>;
  disconnectMoodle: () => void;
  syncMoodle: () => Promise<{ disciplines: number; activities: number }>;
  connectSuap: (matricula: string, senha: string) => Promise<void>;
  disconnectSuap: () => void;
  syncSuap: () => Promise<{
    disciplines: number;
    assessments: number;
    absences: number;
  }>;
}

const AppContext = createContext<AppContextValue | null>(null);

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((x) => x.id === item.id);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = item;
  return next;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    loadData().then((data) => {
      setState(data);
      setReady(true);
    });
    setupNotificationChannel();
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  // Flush imediato ao sair/minimizar, para não perder a última alteração
  // feita dentro da janela de debounce de 300ms.
  useEffect(() => {
    const flush = () => {
      saveData(stateRef.current);
    };
    if (Platform.OS === "web") {
      window.addEventListener("beforeunload", flush);
      window.addEventListener("pagehide", flush);
      return () => {
        window.removeEventListener("beforeunload", flush);
        window.removeEventListener("pagehide", flush);
      };
    }
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "background" || status === "inactive") flush();
    });
    return () => subscription.remove();
  }, []);

  const upsertDiscipline = useCallback((discipline: Discipline) => {
    setState((s) => ({
      ...s,
      disciplines: upsert(s.disciplines, discipline),
    }));
  }, []);

  const deleteDiscipline = useCallback((id: string) => {
    const current = stateRef.current;
    const notificationIds = [
      ...current.activities.filter((a) => a.disciplineId === id),
      ...current.exams.filter((e) => e.disciplineId === id),
    ].flatMap((item) => item.notificationIds);
    cancelReminders(notificationIds);
    setState((s) => ({
      ...s,
      disciplines: s.disciplines.filter((d) => d.id !== id),
      activities: s.activities.filter((a) => a.disciplineId !== id),
      exams: s.exams.filter((e) => e.disciplineId !== id),
      notes: s.notes.filter((n) => n.disciplineId !== id),
      assessments: s.assessments.filter((a) => a.disciplineId !== id),
      absences: s.absences.filter((a) => a.disciplineId !== id),
      studySessions: s.studySessions.filter((x) => x.disciplineId !== id),
    }));
  }, []);

  const upsertActivity = useCallback(
    async (activity: Activity) => {
      const previous = state.activities.find((a) => a.id === activity.id);
      if (previous) await cancelReminders(previous.notificationIds);

      const discipline = state.disciplines.find(
        (d) => d.id === activity.disciplineId,
      );
      const notificationIds = activity.completed
        ? []
        : await scheduleReminders({
            title: `📌 ${activity.title}`,
            subtitle: discipline ? discipline.name : "Atividade",
            targetISO: activity.dueISO,
            reminders: activity.reminders,
            groupId: activity.id,
          });

      if (
        !activity.completed &&
        new Date(activity.dueISO).getTime() < Date.now()
      ) {
        const overdueId = await scheduleOverdueReminder(
          activity.title,
          activity.id,
        );
        if (overdueId) notificationIds.push(overdueId);
      }

      setState((s) => ({
        ...s,
        activities: upsert(s.activities, { ...activity, notificationIds }),
      }));
    },
    [state.activities, state.disciplines],
  );

  const toggleActivityCompleted = useCallback(
    async (id: string) => {
      const activity = state.activities.find((a) => a.id === id);
      if (!activity) return;

      const completed = !activity.completed;
      let notificationIds: string[] = [];

      if (completed) {
        await cancelReminders(activity.notificationIds);
      } else {
        const discipline = state.disciplines.find(
          (d) => d.id === activity.disciplineId,
        );
        notificationIds = await scheduleReminders({
          title: `📌 ${activity.title}`,
          subtitle: discipline ? discipline.name : "Atividade",
          targetISO: activity.dueISO,
          reminders: activity.reminders,
          groupId: activity.id,
        });
        if (new Date(activity.dueISO).getTime() < Date.now()) {
          const overdueId = await scheduleOverdueReminder(
            activity.title,
            activity.id,
          );
          if (overdueId) notificationIds.push(overdueId);
        }
      }

      setState((s) => ({
        ...s,
        activities: s.activities.map((a) =>
          a.id === id
            ? {
                ...a,
                completed,
                completedAt: completed ? new Date().toISOString() : undefined,
                notificationIds,
              }
            : a,
        ),
      }));
    },
    [state.activities, state.disciplines],
  );

  const deleteActivity = useCallback((id: string) => {
    const activity = stateRef.current.activities.find((a) => a.id === id);
    if (activity) cancelReminders(activity.notificationIds);
    setState((s) => ({
      ...s,
      activities: s.activities.filter((a) => a.id !== id),
    }));
  }, []);

  const upsertExam = useCallback(
    async (exam: Exam) => {
      const previous = state.exams.find((e) => e.id === exam.id);
      if (previous) await cancelReminders(previous.notificationIds);

      const discipline = state.disciplines.find(
        (d) => d.id === exam.disciplineId,
      );
      const notificationIds = await scheduleReminders({
        title: `📝 Prova: ${discipline ? discipline.name : exam.content}`,
        subtitle: exam.content,
        targetISO: exam.dateISO,
        reminders: exam.reminders,
        groupId: exam.id,
      });

      setState((s) => ({
        ...s,
        exams: upsert(s.exams, { ...exam, notificationIds }),
      }));
    },
    [state.exams, state.disciplines],
  );

  const deleteExam = useCallback((id: string) => {
    const exam = stateRef.current.exams.find((e) => e.id === id);
    if (exam) cancelReminders(exam.notificationIds);
    setState((s) => ({ ...s, exams: s.exams.filter((e) => e.id !== id) }));
  }, []);

  const upsertNote = useCallback((note: Note) => {
    setState((s) => ({ ...s, notes: upsert(s.notes, note) }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const upsertAssessment = useCallback((assessment: Assessment) => {
    setState((s) => ({
      ...s,
      assessments: upsert(s.assessments, assessment),
    }));
  }, []);

  const deleteAssessment = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      assessments: s.assessments.filter((a) => a.id !== id),
    }));
  }, []);

  const addAbsence = useCallback((absence: AbsenceEntry) => {
    setState((s) => ({ ...s, absences: [...s.absences, absence] }));
  }, []);

  const deleteAbsence = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      absences: s.absences.filter((a) => a.id !== id),
    }));
  }, []);

  const addStudySession = useCallback((session: StudySession) => {
    setState((s) => ({
      ...s,
      studySessions: [...s.studySessions, session],
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...partial } }));
  }, []);

  const connectMoodle = useCallback(async () => {
    if (Platform.OS === "web") {
      throw new Error(
        "Login do AVA só funciona no app instalado no celular, não na versão web.",
      );
    }
    const { token } = await loginMoodleViaSSO();
    const siteInfo = await fetchMoodleSiteInfo(token);
    setState((s) => ({
      ...s,
      integrations: {
        ...s.integrations,
        moodle: {
          connected: true,
          baseUrl: MOODLE_BASE_URL,
          displayName: siteInfo.fullname,
          token,
          lastSyncISO: null,
        },
      },
    }));
  }, []);

  const disconnectMoodle = useCallback(() => {
    setState((s) => ({
      ...s,
      integrations: { ...s.integrations, moodle: null },
    }));
  }, []);

  const syncMoodle = useCallback(async () => {
    const current = stateRef.current;
    const moodle = current.integrations.moodle;
    if (!moodle || !moodle.token) {
      throw new Error("Conecte o AVA primeiro, em Ajustes > Integrações.");
    }

    const courses = await fetchMoodleCourses(moodle.token);
    const disciplineIdByCourse = new Map<number, string>();
    const nextDisciplines = [...current.disciplines];

    courses.forEach((course, index) => {
      const externalId = String(course.id);
      const existingIndex = nextDisciplines.findIndex(
        (d) => d.externalSource === "moodle" && d.externalId === externalId,
      );
      const disciplineId =
        existingIndex === -1
          ? `moodle-course-${course.id}`
          : nextDisciplines[existingIndex].id;
      disciplineIdByCourse.set(course.id, disciplineId);

      if (existingIndex === -1) {
        const created: Discipline = {
          id: disciplineId,
          name: course.fullname,
          professor: "",
          workloadHours: 0,
          semester: current.settings.semesterLabel,
          color: disciplineColors[index % disciplineColors.length],
          icon: disciplineIcons[index % disciplineIcons.length],
          classDays: [],
          evaluation: {
            mode: "simples",
            passingGrade: DEFAULT_PASSING_GRADE,
            maxGrade: DEFAULT_MAX_GRADE,
          },
          goals: [],
          createdAt: new Date().toISOString(),
          externalSource: "moodle",
          externalId,
        };
        nextDisciplines.push(created);
      } else {
        nextDisciplines[existingIndex] = {
          ...nextDisciplines[existingIndex],
          name: course.fullname,
        };
      }
    });

    const assignments = await fetchMoodleAssignments(
      moodle.token,
      courses.map((c) => c.id),
    );
    const nextActivities = [...current.activities];
    const notificationsToCancel: string[] = [];
    const scheduleTasks: Array<() => Promise<void>> = [];

    for (const assignment of assignments) {
      if (!assignment.duedate) continue;
      const externalId = String(assignment.id);
      const disciplineId = disciplineIdByCourse.get(assignment.course);
      if (!disciplineId) continue;
      const discipline = nextDisciplines.find((d) => d.id === disciplineId);
      const dueISO = new Date(assignment.duedate * 1000).toISOString();
      const existingIndex = nextActivities.findIndex(
        (a) => a.externalSource === "moodle" && a.externalId === externalId,
      );

      if (existingIndex === -1) {
        const activity: Activity = {
          id: `moodle-assign-${assignment.id}`,
          disciplineId,
          title: assignment.name,
          description: assignment.intro,
          dueISO,
          priority: "media",
          checklist: [],
          attachments: [],
          completed: false,
          reminders: current.settings.defaultReminders,
          notificationIds: [],
          createdAt: new Date().toISOString(),
          externalSource: "moodle",
          externalId,
        };
        scheduleTasks.push(async () => {
          activity.notificationIds = await scheduleReminders({
            title: `📌 ${activity.title}`,
            subtitle: discipline ? discipline.name : "Atividade do AVA",
            targetISO: activity.dueISO,
            reminders: activity.reminders,
            groupId: activity.id,
          });
        });
        nextActivities.push(activity);
      } else {
        const prev = nextActivities[existingIndex];
        if (prev.dueISO !== dueISO || prev.title !== assignment.name) {
          notificationsToCancel.push(...prev.notificationIds);
          const updated: Activity = {
            ...prev,
            title: assignment.name,
            description: assignment.intro,
            dueISO,
          };
          scheduleTasks.push(async () => {
            updated.notificationIds = updated.completed
              ? []
              : await scheduleReminders({
                  title: `📌 ${updated.title}`,
                  subtitle: discipline ? discipline.name : "Atividade do AVA",
                  targetISO: updated.dueISO,
                  reminders: updated.reminders,
                  groupId: updated.id,
                });
          });
          nextActivities[existingIndex] = updated;
        }
      }
    }

    if (notificationsToCancel.length) {
      await cancelReminders(notificationsToCancel);
    }
    for (const task of scheduleTasks) await task();

    setState((s) => ({
      ...s,
      disciplines: nextDisciplines,
      activities: nextActivities,
      integrations: {
        ...s.integrations,
        moodle: s.integrations.moodle
          ? { ...s.integrations.moodle, lastSyncISO: new Date().toISOString() }
          : null,
      },
    }));

    return {
      disciplines: courses.length,
      activities: assignments.filter((a) => a.duedate).length,
    };
  }, []);

  const connectSuap = useCallback(async (matricula: string, senha: string) => {
    if (Platform.OS === "web") {
      throw new Error(
        "Login do SUAP só funciona no app instalado no celular, não na versão web.",
      );
    }
    const { token } = await loginSuap(matricula, senha);
    const dados = await fetchSuapMeusDados(token);
    setState((s) => ({
      ...s,
      integrations: {
        ...s.integrations,
        suap: {
          connected: true,
          baseUrl: SUAP_BASE_URL,
          displayName: dados.nome_usual ?? dados.nome ?? matricula,
          matricula: dados.matricula ?? matricula,
          token,
          lastSyncISO: null,
        },
      },
    }));
  }, []);

  const disconnectSuap = useCallback(() => {
    setState((s) => ({
      ...s,
      integrations: { ...s.integrations, suap: null },
    }));
  }, []);

  const syncSuap = useCallback(async () => {
    const current = stateRef.current;
    const suap = current.integrations.suap;
    if (!suap || !suap.token) {
      throw new Error("Conecte o SUAP primeiro, em Ajustes > Integrações.");
    }

    const [anoStr, periodoStr] = current.settings.semesterLabel.split("/");
    const ano = Number(anoStr);
    const periodo = Number(periodoStr);
    if (!ano || !periodo) {
      throw new Error(
        "Configure o semestre atual em Ajustes antes de sincronizar o SUAP.",
      );
    }

    const boletim = await fetchSuapBoletim(suap.token, ano, periodo);
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-");

    const disciplineIdByExternalId = new Map<string, string>();
    const nextDisciplines = [...current.disciplines];

    boletim.forEach((disc, index) => {
      const externalId = disc.codigo ?? slugify(disc.disciplina);
      const existingIndex = nextDisciplines.findIndex(
        (d) => d.externalSource === "suap" && d.externalId === externalId,
      );
      const disciplineId =
        existingIndex === -1
          ? `suap-disc-${externalId}`
          : nextDisciplines[existingIndex].id;
      disciplineIdByExternalId.set(externalId, disciplineId);

      if (existingIndex === -1) {
        const created: Discipline = {
          id: disciplineId,
          name: disc.disciplina,
          professor: disc.professor ?? "",
          workloadHours: disc.carga_horaria ?? 0,
          semester: current.settings.semesterLabel,
          color: disciplineColors[index % disciplineColors.length],
          icon: disciplineIcons[index % disciplineIcons.length],
          classDays: [],
          evaluation: {
            mode: "simples",
            passingGrade: DEFAULT_PASSING_GRADE,
            maxGrade: DEFAULT_MAX_GRADE,
          },
          goals: [],
          createdAt: new Date().toISOString(),
          externalSource: "suap",
          externalId,
        };
        nextDisciplines.push(created);
      } else {
        nextDisciplines[existingIndex] = {
          ...nextDisciplines[existingIndex],
          name: disc.disciplina,
          professor: disc.professor ?? nextDisciplines[existingIndex].professor,
          workloadHours:
            disc.carga_horaria ?? nextDisciplines[existingIndex].workloadHours,
        };
      }
    });

    const nextAssessments = [...current.assessments];
    boletim.forEach((disc) => {
      const disciplineExternalId = disc.codigo ?? slugify(disc.disciplina);
      const disciplineId = disciplineIdByExternalId.get(disciplineExternalId);
      if (!disciplineId) return;
      (disc.notas ?? []).forEach((nota, etapaIndex) => {
        const externalId = `${disciplineExternalId}-etapa-${etapaIndex}`;
        const existingIndex = nextAssessments.findIndex(
          (a) => a.externalSource === "suap" && a.externalId === externalId,
        );
        const assessment: Assessment = {
          id:
            existingIndex === -1
              ? `suap-assessment-${externalId}`
              : nextAssessments[existingIndex].id,
          disciplineId,
          name: nota.descricao ?? `Etapa ${etapaIndex + 1}`,
          weight: 1,
          grade: nota.nota ?? null,
          externalSource: "suap",
          externalId,
        };
        if (existingIndex === -1) {
          nextAssessments.push(assessment);
        } else {
          nextAssessments[existingIndex] = assessment;
        }
      });
    });

    // Diferente de addAbsence (um registro por falta real), o SUAP só
    // devolve o total acumulado de faltas por disciplina no período — por
    // isso mantemos UM registro agregado por disciplina, atualizado a cada
    // sync, em vez de acumular uma linha nova a cada sincronização.
    const nextAbsences = [...current.absences];
    boletim.forEach((disc) => {
      const disciplineExternalId = disc.codigo ?? slugify(disc.disciplina);
      const disciplineId = disciplineIdByExternalId.get(disciplineExternalId);
      if (!disciplineId || disc.faltas == null) return;
      const existingIndex = nextAbsences.findIndex(
        (a) =>
          a.externalSource === "suap" &&
          a.externalId === disciplineExternalId,
      );
      const absence: AbsenceEntry = {
        id:
          existingIndex === -1
            ? `suap-absence-${disciplineExternalId}`
            : nextAbsences[existingIndex].id,
        disciplineId,
        dateISO: new Date().toISOString(),
        hours: disc.faltas,
        note: "Frequência sincronizada do SUAP",
        externalSource: "suap",
        externalId: disciplineExternalId,
      };
      if (existingIndex === -1) {
        nextAbsences.push(absence);
      } else {
        nextAbsences[existingIndex] = absence;
      }
    });

    // Horário: endpoint ainda não confirmado contra suap.ufr.edu.br — se
    // falhar, não deve derrubar o resto da sincronização (boletim já é
    // válido sozinho).
    try {
      const horario = await fetchSuapHorario(suap.token, ano, periodo);
      const slotsByDisciplineId = new Map<string, ScheduleSlot[]>();
      horario.forEach((slot) => {
        const disciplineExternalId = slugify(slot.disciplina);
        const disciplineId =
          disciplineIdByExternalId.get(disciplineExternalId) ??
          [...disciplineIdByExternalId.entries()].find(([extId]) =>
            extId.startsWith(disciplineExternalId),
          )?.[1];
        if (!disciplineId) return;
        const list = slotsByDisciplineId.get(disciplineId) ?? [];
        list.push({
          day: slot.dia_semana,
          startTime: slot.horario_inicio,
          endTime: slot.horario_fim,
          room: slot.sala,
        });
        slotsByDisciplineId.set(disciplineId, list);
      });
      slotsByDisciplineId.forEach((slots, disciplineId) => {
        const index = nextDisciplines.findIndex((d) => d.id === disciplineId);
        if (index === -1) return;
        nextDisciplines[index] = {
          ...nextDisciplines[index],
          scheduleSlots: slots,
          classDays: [...new Set(slots.map((s) => s.day))],
        };
      });
    } catch (err) {
      console.warn("[HubAcad] Falha ao sincronizar horário do SUAP", err);
    }

    setState((s) => ({
      ...s,
      disciplines: nextDisciplines,
      assessments: nextAssessments,
      absences: nextAbsences,
      integrations: {
        ...s.integrations,
        suap: s.integrations.suap
          ? { ...s.integrations.suap, lastSyncISO: new Date().toISOString() }
          : null,
      },
    }));

    return {
      disciplines: boletim.length,
      assessments: boletim.reduce((sum, d) => sum + (d.notas?.length ?? 0), 0),
      absences: boletim.filter((d) => d.faltas != null).length,
    };
  }, []);

  const value: AppContextValue = {
    state,
    ready,
    upsertDiscipline,
    deleteDiscipline,
    upsertActivity,
    toggleActivityCompleted,
    deleteActivity,
    upsertExam,
    deleteExam,
    upsertNote,
    deleteNote,
    upsertAssessment,
    deleteAssessment,
    addAbsence,
    deleteAbsence,
    addStudySession,
    updateSettings,
    connectMoodle,
    disconnectMoodle,
    syncMoodle,
    connectSuap,
    disconnectSuap,
    syncSuap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp deve ser usado dentro de AppProvider");
  }
  return context;
}
