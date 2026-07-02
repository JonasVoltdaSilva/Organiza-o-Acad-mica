import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";

import { useApp } from "../providers/AppProvider";
import { Activity, Discipline, Exam } from "../types";
import { summarizeAttendance } from "../utils/attendance";
import { summarizeGrades } from "../utils/grades";

export interface DashboardData {
  upcomingActivities: Activity[];
  upcomingExams: Exam[];
  overdueActivities: Activity[];
  todayDisciplines: Discipline[];
  semesterProgress: number;
  semesterDaysLeft: number;
  completionPercent: number;
  averageAttendance: number | null;
  overallAverage: number | null;
  nextDeadline:
    | { kind: "atividade" | "prova"; title: string; dateISO: string }
    | null;
}

export function useDashboard(): DashboardData {
  const { state } = useApp();

  return useMemo(() => {
    const now = Date.now();

    const pending = state.activities.filter((a) => !a.completed);
    const upcomingActivities = pending
      .filter((a) => new Date(a.dueISO).getTime() >= now)
      .sort((a, b) => new Date(a.dueISO).getTime() - new Date(b.dueISO).getTime());
    const overdueActivities = pending
      .filter((a) => new Date(a.dueISO).getTime() < now)
      .sort((a, b) => new Date(b.dueISO).getTime() - new Date(a.dueISO).getTime());

    const upcomingExams = state.exams
      .filter((e) => new Date(e.dateISO).getTime() >= now)
      .sort(
        (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
      );

    const weekday = new Date().getDay();
    const todayDisciplines = state.disciplines.filter((d) =>
      d.classDays.includes(weekday),
    );

    const start = new Date(state.settings.semesterStartISO).getTime();
    const end = new Date(state.settings.semesterEndISO).getTime();
    const semesterProgress =
      end > start ? Math.min(1, Math.max(0, (now - start) / (end - start))) : 0;
    const semesterDaysLeft = Math.max(
      0,
      differenceInCalendarDays(new Date(state.settings.semesterEndISO), new Date()),
    );

    const total = state.activities.length;
    const done = state.activities.filter((a) => a.completed).length;
    const completionPercent = total > 0 ? (done / total) * 100 : 0;

    const attendances = state.disciplines.map((d) =>
      summarizeAttendance(
        d.workloadHours,
        state.absences.filter((a) => a.disciplineId === d.id),
      ),
    );
    const averageAttendance =
      attendances.length > 0
        ? attendances.reduce((s, a) => s + a.attendancePercent, 0) /
          attendances.length
        : null;

    const averages = state.disciplines
      .map((d) =>
        summarizeGrades(
          state.assessments.filter((a) => a.disciplineId === d.id),
          d.evaluation,
        ).partialAverage,
      )
      .filter((v): v is number => v !== null);
    const overallAverage =
      averages.length > 0
        ? averages.reduce((s, v) => s + v, 0) / averages.length
        : null;

    const deadlineCandidates = [
      ...upcomingActivities.map((a) => ({
        kind: "atividade" as const,
        title: a.title,
        dateISO: a.dueISO,
      })),
      ...upcomingExams.map((e) => ({
        kind: "prova" as const,
        title: e.content,
        dateISO: e.dateISO,
      })),
    ].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
    );

    return {
      upcomingActivities,
      upcomingExams,
      overdueActivities,
      todayDisciplines,
      semesterProgress,
      semesterDaysLeft,
      completionPercent,
      averageAttendance,
      overallAverage,
      nextDeadline: deadlineCandidates[0] ?? null,
    };
  }, [state]);
}
