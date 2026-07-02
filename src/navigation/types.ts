import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  DisciplineHub: { disciplineId: string };
  DisciplineForm: { disciplineId?: string };
  ActivityForm: { activityId?: string; disciplineId?: string };
  ExamForm: { examId?: string; disciplineId?: string };
  NoteEditor: { noteId?: string; disciplineId: string };
  Search: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Início: undefined;
  Disciplinas: undefined;
  Calendário: undefined;
  Estatísticas: undefined;
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
