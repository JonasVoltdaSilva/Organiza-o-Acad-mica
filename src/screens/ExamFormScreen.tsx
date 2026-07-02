import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DateTimeField } from "../components/form/DateTimeField";
import { DisciplinePicker } from "../components/form/DisciplinePicker";
import { FormSheet } from "../components/form/FormSheet";
import { ReminderPicker } from "../components/form/ReminderPicker";
import { Field } from "../components/ui/Field";
import { PressableScale } from "../components/ui/PressableScale";
import { RootStackParamList } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { createId } from "../utils/id";

type FormRoute = RouteProp<RootStackParamList, "ExamForm">;

export function ExamFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const { state, upsertExam, deleteExam } = useApp();

  const existing = state.exams.find((e) => e.id === route.params?.examId);

  const [disciplineId, setDisciplineId] = useState<string | null>(
    existing?.disciplineId ?? route.params?.disciplineId ?? null,
  );
  const [content, setContent] = useState(existing?.content ?? "");
  const [dateISO, setDateISO] = useState<string | null>(
    existing?.dateISO ?? null,
  );
  const [location, setLocation] = useState(existing?.location ?? "");
  const [observations, setObservations] = useState(
    existing?.observations ?? "",
  );
  const [reminders, setReminders] = useState<number[]>(
    existing?.reminders ?? state.settings.defaultReminders,
  );

  const valid = content.trim().length > 0 && !!disciplineId && !!dateISO;

  const save = async () => {
    if (!valid || !disciplineId || !dateISO) return;
    await upsertExam({
      id: existing?.id ?? createId(),
      disciplineId,
      content: content.trim(),
      dateISO,
      location: location.trim() || undefined,
      observations: observations.trim() || undefined,
      reminders,
      notificationIds: existing?.notificationIds ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    navigation.goBack();
  };

  return (
    <FormSheet
      title={existing ? "Editar prova" : "Nova prova"}
      onSave={save}
      saveEnabled={valid}
    >
      <DisciplinePicker selectedId={disciplineId} onChange={setDisciplineId} />
      <Field
        label="Conteúdo"
        value={content}
        onChangeText={setContent}
        placeholder="Ex.: Unidades 1 a 3 — derivadas e limites"
        multiline
        autoFocus={!existing}
      />
      <DateTimeField label="Data da prova" valueISO={dateISO} onChange={setDateISO} />
      <Field
        label="Local (opcional)"
        value={location}
        onChangeText={setLocation}
        placeholder="Ex.: Bloco C, sala 12"
      />
      <ReminderPicker selected={reminders} onChange={setReminders} />
      <Field
        label="Observações"
        value={observations}
        onChangeText={setObservations}
        placeholder="Ex.: levar calculadora"
        multiline
      />

      {existing ? (
        <PressableScale
          onPress={() => {
            deleteExam(existing.id);
            navigation.goBack();
          }}
        >
          <View style={[styles.deleteButton, { backgroundColor: `${theme.danger}18` }]}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[typography.body, { color: theme.danger, fontWeight: "700" }]}>
              Excluir prova
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
});
