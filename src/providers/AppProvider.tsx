import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import {
  cancelReminders,
  scheduleOverdueReminder,
  scheduleReminders,
  setupNotificationChannel,
} from "../services/notifications";
import { emptyData, loadData, saveData } from "../services/storage";
import {
  AbsenceEntry,
  Activity,
  AppData,
  Assessment,
  Discipline,
  Exam,
  Note,
  Settings,
  StudySession,
} from "../types";
import { advanceStreak } from "../utils/streak";

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
      studyStreak: advanceStreak(s.studyStreak, session.dateISO),
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...partial } }));
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
