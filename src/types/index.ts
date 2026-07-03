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

export type ExternalSource = "moodle" | "suap";

export interface Assessment {
  id: string;
  disciplineId: string;
  name: string;
  weight: number;
  /** null enquanto a nota não foi lançada */
  grade: number | null;
  /** presente quando a avaliação veio de uma sincronização externa (SUAP) */
  externalSource?: ExternalSource;
  externalId?: string;
}

export interface AbsenceEntry {
  id: string;
  disciplineId: string;
  dateISO: string;
  hours: number;
  note?: string;
  /** presente quando a falta veio de uma sincronização externa (SUAP) */
  externalSource?: ExternalSource;
  externalId?: string;
}

export interface ScheduleSlot {
  /** dia da semana: 0 = domingo ... 6 = sábado */
  day: number;
  /** "HH:mm" */
  startTime?: string;
  endTime?: string;
  room?: string;
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
  /** horário detalhado (dia + hora + sala), populado pela sincronização com o SUAP */
  scheduleSlots?: ScheduleSlot[];
  evaluation: EvaluationConfig;
  goals: Goal[];
  createdAt: string;
  /** presente quando a disciplina veio de uma sincronização externa (AVA/SUAP) */
  externalSource?: ExternalSource;
  externalId?: string;
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
  /** presente quando a atividade veio de uma sincronização externa (AVA) */
  externalSource?: ExternalSource;
  externalId?: string;
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
}

export interface MoodleIntegration {
  connected: boolean;
  baseUrl: string;
  displayName: string;
  token: string;
  lastSyncISO: string | null;
}

export interface SuapIntegration {
  connected: boolean;
  baseUrl: string;
  displayName: string;
  matricula: string;
  token: string;
  lastSyncISO: string | null;
}

export interface Integrations {
  moodle: MoodleIntegration | null;
  suap: SuapIntegration | null;
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
  integrations: Integrations;
}
