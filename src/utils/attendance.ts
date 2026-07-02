import {
  ABSENCE_WARNING_RATIO,
  MAX_ABSENCE_RATIO,
} from "../constants";
import { AbsenceEntry } from "../types";

export type AttendanceStatus = "ok" | "alerta" | "excedido";

export interface AttendanceSummary {
  workloadHours: number;
  maxAbsenceHours: number;
  usedAbsenceHours: number;
  remainingAbsenceHours: number;
  /** 0–1: fração das faltas permitidas já usada */
  usedRatio: number;
  attendancePercent: number;
  absencePercent: number;
  status: AttendanceStatus;
}

/**
 * Regra da UFR: frequência mínima de 75%, logo o aluno pode
 * faltar no máximo 25% da carga horária da disciplina.
 */
export function summarizeAttendance(
  workloadHours: number,
  absences: AbsenceEntry[],
): AttendanceSummary {
  const maxAbsenceHours = Math.floor(workloadHours * MAX_ABSENCE_RATIO);
  const usedAbsenceHours = absences.reduce((sum, a) => sum + a.hours, 0);
  const remainingAbsenceHours = Math.max(0, maxAbsenceHours - usedAbsenceHours);
  const usedRatio =
    maxAbsenceHours > 0 ? usedAbsenceHours / maxAbsenceHours : 0;

  const absencePercent =
    workloadHours > 0 ? (usedAbsenceHours / workloadHours) * 100 : 0;
  const attendancePercent = Math.max(0, 100 - absencePercent);

  const status: AttendanceStatus =
    usedAbsenceHours > maxAbsenceHours
      ? "excedido"
      : usedRatio >= ABSENCE_WARNING_RATIO
        ? "alerta"
        : "ok";

  return {
    workloadHours,
    maxAbsenceHours,
    usedAbsenceHours,
    remainingAbsenceHours,
    usedRatio: Math.min(1, usedRatio),
    attendancePercent,
    absencePercent,
    status,
  };
}
