import { RISK_DUE_SOON_DAYS, RISK_OVERDUE_COUNT_THRESHOLD } from "../constants";
import { Activity } from "../types";
import { AttendanceStatus, AttendanceSummary } from "./attendance";
import { daysUntil, isOverdue } from "./dates";
import { GradeSituation, GradeSummary } from "./grades";

export type RiskLevel = "baixo" | "medio" | "alto";

export interface AcademicRisk {
  level: RiskLevel;
  reason: string;
  sources: {
    attendance: RiskLevel;
    grades: RiskLevel;
    activities: RiskLevel;
  };
}

export interface OverallRisk extends AcademicRisk {
  atRiskCount: number;
  attentionCount: number;
}

export function attendanceRiskLevel(status: AttendanceStatus): RiskLevel {
  if (status === "excedido") return "alto";
  if (status === "alerta") return "medio";
  return "baixo";
}

export function gradesRiskLevel(situation: GradeSituation): RiskLevel {
  if (situation === "reprovado") return "alto";
  if (situation === "em_recuperacao") return "medio";
  return "baixo";
}

export function activitiesRiskLevel(
  pendingActivities: Activity[],
  nowISO?: string,
): RiskLevel {
  const isLate = (iso: string) =>
    nowISO ? new Date(iso).getTime() < new Date(nowISO).getTime() : isOverdue(iso);
  const daysAway = (iso: string) =>
    nowISO
      ? Math.ceil(
          (new Date(iso).getTime() - new Date(nowISO).getTime()) / (24 * 60 * 60 * 1000),
        )
      : daysUntil(iso);

  const overdue = pendingActivities.filter((a) => isLate(a.dueISO));
  const overdueHighPriority = overdue.filter(
    (a) => a.priority === "alta" || a.priority === "urgente",
  );
  const dueSoonUrgent = pendingActivities.filter(
    (a) =>
      !isLate(a.dueISO) &&
      daysAway(a.dueISO) <= RISK_DUE_SOON_DAYS &&
      (a.priority === "alta" || a.priority === "urgente"),
  );

  if (overdueHighPriority.length > 0 || overdue.length >= RISK_OVERDUE_COUNT_THRESHOLD) {
    return "alto";
  }
  if (overdue.length > 0 || dueSoonUrgent.length > 0) {
    return "medio";
  }
  return "baixo";
}

export function evaluateAcademicRisk(
  attendance: AttendanceSummary,
  grades: GradeSummary,
  pendingActivities: Activity[],
): AcademicRisk {
  const sources = {
    attendance: attendanceRiskLevel(attendance.status),
    grades: gradesRiskLevel(grades.situation),
    activities: activitiesRiskLevel(pendingActivities),
  };

  if (sources.attendance === "alto") {
    return { level: "alto", reason: "Limite de faltas ultrapassado", sources };
  }
  if (sources.grades === "alto") {
    return { level: "alto", reason: "Reprovado nas avaliações lançadas", sources };
  }
  if (sources.activities === "alto") {
    return { level: "alto", reason: "Atividades importantes atrasadas", sources };
  }
  if (sources.grades === "medio") {
    return {
      level: "medio",
      reason: "Em recuperação — depende das próximas avaliações",
      sources,
    };
  }
  if (sources.attendance === "medio") {
    return { level: "medio", reason: "Perto do limite de faltas", sources };
  }
  if (sources.activities === "medio") {
    return { level: "medio", reason: "Atividades pendentes se acumulando", sources };
  }
  return { level: "baixo", reason: "Sem sinais de risco no momento", sources };
}

export function summarizeOverallRisk(disciplineRisks: AcademicRisk[]): OverallRisk {
  const atRiskCount = disciplineRisks.filter((r) => r.level === "alto").length;
  const attentionCount = disciplineRisks.filter((r) => r.level === "medio").length;

  if (atRiskCount > 0) {
    const worst = disciplineRisks.find((r) => r.level === "alto")!;
    return {
      level: "alto",
      reason:
        atRiskCount === 1
          ? worst.reason
          : `${atRiskCount} disciplinas em risco`,
      sources: worst.sources,
      atRiskCount,
      attentionCount,
    };
  }
  if (attentionCount > 0) {
    const first = disciplineRisks.find((r) => r.level === "medio")!;
    return {
      level: "medio",
      reason:
        attentionCount === 1
          ? first.reason
          : `${attentionCount} disciplinas pedem atenção`,
      sources: first.sources,
      atRiskCount,
      attentionCount,
    };
  }
  return {
    level: "baixo",
    reason: "Tudo em dia neste semestre",
    sources: { attendance: "baixo", grades: "baixo", activities: "baixo" },
    atRiskCount,
    attentionCount,
  };
}
