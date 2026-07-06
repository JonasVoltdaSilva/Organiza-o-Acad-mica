import { Priority, Settings } from "../types";

/** Regra UFR: frequência mínima de 75% da carga horária. */
export const MIN_ATTENDANCE_RATIO = 0.75;
export const MAX_ABSENCE_RATIO = 1 - MIN_ATTENDANCE_RATIO;

/** Percentual de faltas usadas a partir do qual o app alerta em amarelo. */
export const ABSENCE_WARNING_RATIO = 0.7;

/** Nº de atividades pendentes atrasadas a partir do qual o risco por atividades vira "alto". */
export const RISK_OVERDUE_COUNT_THRESHOLD = 3;
/** Janela (dias) para considerar uma atividade de prioridade alta/urgente como "vencendo em breve". */
export const RISK_DUE_SOON_DAYS = 2;

export const DEFAULT_PASSING_GRADE = 6;
export const DEFAULT_MAX_GRADE = 10;
export const DEFAULT_CLASS_HOURS = 2;

const MINUTE = 1;
const HOUR = 60;
const DAY = 24 * HOUR;

/** Opções de lembrete em minutos de antecedência. */
export const REMINDER_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 30 * DAY, label: "30 dias antes" },
  { minutes: 15 * DAY, label: "15 dias antes" },
  { minutes: 7 * DAY, label: "7 dias antes" },
  { minutes: 5 * DAY, label: "5 dias antes" },
  { minutes: 3 * DAY, label: "3 dias antes" },
  { minutes: 2 * DAY, label: "2 dias antes" },
  { minutes: 1 * DAY, label: "1 dia antes" },
  { minutes: 12 * HOUR, label: "12 horas antes" },
  { minutes: 6 * HOUR, label: "6 horas antes" },
  { minutes: 3 * HOUR, label: "3 horas antes" },
  { minutes: 1 * HOUR, label: "1 hora antes" },
  { minutes: 30 * MINUTE, label: "30 minutos antes" },
  { minutes: 15 * MINUTE, label: "15 minutos antes" },
];

export const PRIORITIES: {
  value: Priority;
  label: string;
  color: string;
}[] = [
  { value: "baixa", label: "Baixa", color: "#74C365" },
  { value: "media", label: "Média", color: "#E8B93B" },
  { value: "alta", label: "Alta", color: "#E07A3F" },
  { value: "urgente", label: "Urgente", color: "#D9534F" },
];

export const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];
export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function defaultSettings(): Settings {
  const now = new Date();
  const firstSemester = now.getMonth() < 6;
  const start = new Date(now.getFullYear(), firstSemester ? 1 : 7, 1);
  const end = new Date(now.getFullYear(), firstSemester ? 6 : 11, 15);
  return {
    userName: "",
    semesterLabel: `${now.getFullYear()}/${firstSemester ? 1 : 2}`,
    semesterStartISO: start.toISOString(),
    semesterEndISO: end.toISOString(),
    theme: "system",
    hapticsEnabled: true,
    defaultReminders: [7 * DAY, 1 * DAY, 3 * HOUR],
    streakEnabled: false,
  };
}

/** Feriados nacionais fixos (mês é 1-based). */
export const FIXED_HOLIDAYS: { day: number; month: number; name: string }[] = [
  { day: 1, month: 1, name: "Confraternização Universal" },
  { day: 21, month: 4, name: "Tiradentes" },
  { day: 1, month: 5, name: "Dia do Trabalho" },
  { day: 7, month: 9, name: "Independência do Brasil" },
  { day: 12, month: 10, name: "Nossa Senhora Aparecida" },
  { day: 2, month: 11, name: "Finados" },
  { day: 15, month: 11, name: "Proclamação da República" },
  { day: 20, month: 11, name: "Consciência Negra" },
  { day: 25, month: 12, name: "Natal" },
];
