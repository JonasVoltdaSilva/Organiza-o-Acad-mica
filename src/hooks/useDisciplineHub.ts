import { useMemo } from "react";

import { useApp } from "../providers/AppProvider";
import {
  AttendanceSummary,
  summarizeAttendance,
} from "../utils/attendance";
import { GradeSummary, summarizeGrades } from "../utils/grades";
import {
  AbsenceEntry,
  Activity,
  Assessment,
  Discipline,
  Exam,
  Goal,
  Note,
} from "../types";

export interface GoalProgress {
  goal: Goal;
  label: string;
  progress: number;
  achieved: boolean;
}

export interface NextDeadline {
  kind: "atividade" | "prova";
  title: string;
  dateISO: string;
  id: string;
}

export interface DisciplineHub {
  discipline: Discipline;
  pendingActivities: Activity[];
  completedActivities: Activity[];
  upcomingExams: Exam[];
  pastExams: Exam[];
  notes: Note[];
  assessments: Assessment[];
  absences: AbsenceEntry[];
  attendance: AttendanceSummary;
  grades: GradeSummary;
  nextDeadline: NextDeadline | null;
  goalProgress: GoalProgress[];
  studyMinutes: number;
}

function byDate<T>(getISO: (item: T) => string) {
  return (a: T, b: T) =>
    new Date(getISO(a)).getTime() - new Date(getISO(b)).getTime();
}

export function useDisciplineHub(disciplineId: string): DisciplineHub | null {
  const { state } = useApp();

  return useMemo(() => {
    const discipline = state.disciplines.find((d) => d.id === disciplineId);
    if (!discipline) return null;

    const activities = state.activities
      .filter((a) => a.disciplineId === disciplineId)
      .sort(byDate((a) => a.dueISO));
    const pendingActivities = activities.filter((a) => !a.completed);
    const completedActivities = activities.filter((a) => a.completed);

    const now = Date.now();
    const exams = state.exams
      .filter((e) => e.disciplineId === disciplineId)
      .sort(byDate((e) => e.dateISO));
    const upcomingExams = exams.filter(
      (e) => new Date(e.dateISO).getTime() >= now,
    );
    const pastExams = exams.filter((e) => new Date(e.dateISO).getTime() < now);

    const notes = state.notes
      .filter((n) => n.disciplineId === disciplineId)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    const assessments = state.assessments.filter(
      (a) => a.disciplineId === disciplineId,
    );
    const absences = state.absences.filter(
      (a) => a.disciplineId === disciplineId,
    );

    const attendance = summarizeAttendance(discipline.workloadHours, absences);
    const grades = summarizeGrades(assessments, discipline.evaluation);

    const futurePending = pendingActivities.filter(
      (a) => new Date(a.dueISO).getTime() >= now,
    );
    const candidates: NextDeadline[] = [
      ...futurePending.map((a) => ({
        kind: "atividade" as const,
        title: a.title,
        dateISO: a.dueISO,
        id: a.id,
      })),
      ...upcomingExams.map((e) => ({
        kind: "prova" as const,
        title: e.content,
        dateISO: e.dateISO,
        id: e.id,
      })),
    ].sort(byDate((c) => c.dateISO));
    const nextDeadline = candidates[0] ?? null;

    const studyMinutes = state.studySessions
      .filter((s) => s.disciplineId === disciplineId)
      .reduce((sum, s) => sum + s.minutes, 0);

    const onTimeCompleted = completedActivities.filter(
      (a) =>
        a.completedAt &&
        new Date(a.completedAt).getTime() <= new Date(a.dueISO).getTime(),
    ).length;

    const goalProgress: GoalProgress[] = discipline.goals.map((goal) => {
      switch (goal.type) {
        case "media": {
          const current = grades.partialAverage ?? 0;
          return {
            goal,
            label: `Média ${goal.target.toFixed(1).replace(".", ",")}`,
            progress: goal.target > 0 ? Math.min(1, current / goal.target) : 0,
            achieved: current >= goal.target && grades.launched.length > 0,
          };
        }
        case "frequencia": {
          const current = attendance.attendancePercent;
          return {
            goal,
            label: `Frequência ≥ ${goal.target}%`,
            progress: goal.target > 0 ? Math.min(1, current / goal.target) : 0,
            achieved: current >= goal.target,
          };
        }
        case "horas_estudo": {
          const hours = studyMinutes / 60;
          return {
            goal,
            label: `Estudar ${goal.target}h`,
            progress: goal.target > 0 ? Math.min(1, hours / goal.target) : 0,
            achieved: hours >= goal.target,
          };
        }
        case "atividades_no_prazo": {
          const total = activities.length;
          const progress = total > 0 ? onTimeCompleted / total : 0;
          return {
            goal,
            label: "Concluir tudo no prazo",
            progress,
            achieved: total > 0 && onTimeCompleted === total,
          };
        }
      }
    });

    return {
      discipline,
      pendingActivities,
      completedActivities,
      upcomingExams,
      pastExams,
      notes,
      assessments,
      absences,
      attendance,
      grades,
      nextDeadline,
      goalProgress,
      studyMinutes,
    };
  }, [state, disciplineId]);
}
