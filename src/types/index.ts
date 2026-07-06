export type Priority = "baixa" | "media" | "alta" | "urgente";

export type ThemePreference = "light" | "dark" | "system";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  kind: "link" | "arquivo" | "imagem";
  label: string;
  uri: string;
}

export type GoalType =
  | "media"
  | "frequencia"
  | "horas_estudo"
  | "atividades_no_prazo";

export interface Goal {
  id: string;
  type: GoalType;
  /** média alvo, % de frequência, horas ou % de atividades no prazo */
  target: number;
}

export type EvaluationMode = "simples" | "ponderada";

export interface EvaluationConfig {
  mode: EvaluationMode;
  /** nota mínima para aprovação direta (padrão UFR: 6.0) */
  passingGrade: number;
  maxGrade: number;
}

export interface Assessment {
  id: string;
  disciplineId: string;
  name: string;
  weight: number;
  /** null enquanto a nota não foi lançada */
  grade: number | null;
}

export interface AbsenceEntry {
  id: string;
  disciplineId: string;
  dateISO: string;
  hours: number;
  note?: string;
}

export interface Discipline {
  id: string;
  name: string;
  professor: string;
  workloadHours: number;
  semester: string;
  color: string;
  icon: string;
  room?: string;
  observations?: string;
  /** dias da semana com aula: 0 = domingo ... 6 = sábado */
  classDays: number[];
  evaluation: EvaluationConfig;
  goals: Goal[];
  createdAt: string;
}

export interface Activity {
  id: string;
  disciplineId: string;
  title: string;
  description?: string;
  dueISO: string;
  priority: Priority;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  observations?: string;
  completed: boolean;
  completedAt?: string;
  /** minutos de antecedência de cada lembrete */
  reminders: number[];
  notificationIds: string[];
  createdAt: string;
}

export interface Exam {
  id: string;
  disciplineId: string;
  content: string;
  dateISO: string;
  location?: string;
  observations?: string;
  reminders: number[];
  notificationIds: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  disciplineId: string;
  title: string;
  body: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  disciplineId: string;
  dateISO: string;
  minutes: number;
}

export interface Settings {
  userName: string;
  semesterLabel: string;
  semesterStartISO: string;
  semesterEndISO: string;
  theme: ThemePreference;
  hapticsEnabled: boolean;
  defaultReminders: number[];
  streakEnabled: boolean;
}

export interface StudyStreak {
  count: number;
  /** ISO da última data em que um estudo foi registrado; "" se nunca */
  lastDateISO: string;
}

export interface AppData {
  disciplines: Discipline[];
  activities: Activity[];
  exams: Exam[];
  notes: Note[];
  assessments: Assessment[];
  absences: AbsenceEntry[];
  studySessions: StudySession[];
  settings: Settings;
  studyStreak: StudyStreak;
}
