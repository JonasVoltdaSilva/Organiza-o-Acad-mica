import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DateTimeField } from "../components/form/DateTimeField";
import { DisciplinePicker } from "../components/form/DisciplinePicker";
import { FormSheet } from "../components/form/FormSheet";
import { ReminderPicker } from "../components/form/ReminderPicker";
import { Chip } from "../components/ui/Chip";
import { Field } from "../components/ui/Field";
import { PressableScale } from "../components/ui/PressableScale";
import { PRIORITIES } from "../constants";
import { RootStackParamList } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { Attachment, ChecklistItem, Priority } from "../types";
import { createId } from "../utils/id";

type FormRoute = RouteProp<RootStackParamList, "ActivityForm">;

export function ActivityFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const { state, upsertActivity, deleteActivity } = useApp();

  const existing = state.activities.find(
    (a) => a.id === route.params?.activityId,
  );

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [disciplineId, setDisciplineId] = useState<string | null>(
    existing?.disciplineId ?? route.params?.disciplineId ?? null,
  );
  const [dueISO, setDueISO] = useState<string | null>(existing?.dueISO ?? null);
  const [priority, setPriority] = useState<Priority>(
    existing?.priority ?? "media",
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    existing?.checklist ?? [],
  );
  const [newItem, setNewItem] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>(
    existing?.attachments ?? [],
  );
  const [newLink, setNewLink] = useState("");
  const [observations, setObservations] = useState(
    existing?.observations ?? "",
  );
  const [reminders, setReminders] = useState<number[]>(
    existing?.reminders ?? state.settings.defaultReminders,
  );

  const valid = title.trim().length > 0 && !!disciplineId && !!dueISO;

  const save = async () => {
    if (!valid || !disciplineId || !dueISO) return;
    await upsertActivity({
      id: existing?.id ?? createId(),
      disciplineId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueISO,
      priority,
      checklist,
      attachments,
      observations: observations.trim() || undefined,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt,
      reminders,
      notificationIds: existing?.notificationIds ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    navigation.goBack();
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist((items) => [
      ...items,
      { id: createId(), text: newItem.trim(), done: false },
    ]);
    setNewItem("");
  };

  const addLink = () => {
    const uri = newLink.trim();
    if (!uri) return;
    setAttachments((items) => [
      ...items,
      { id: createId(), kind: "link", label: uri, uri },
    ]);
    setNewLink("");
  };

  const inlineInputStyle = [
    typography.body,
    styles.inlineInput,
    {
      color: theme.text,
      backgroundColor: theme.surfaceStrong,
      borderColor: theme.surfaceBorder,
    },
  ];

  return (
    <FormSheet
      title={existing ? "Editar atividade" : "Nova atividade"}
      onSave={save}
      saveEnabled={valid}
    >
      <Field
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Ex.: Lista de exercícios 3"
        autoFocus={!existing}
      />
      <Field
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhes da atividade"
        multiline
      />

      <DisciplinePicker selectedId={disciplineId} onChange={setDisciplineId} />
      <DateTimeField label="Entrega" valueISO={dueISO} onChange={setDueISO} />

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        PRIORIDADE
      </Text>
      <View style={styles.chipsRow}>
        {PRIORITIES.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            color={option.color}
            selected={priority === option.value}
            onPress={() => setPriority(option.value)}
          />
        ))}
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        CHECKLIST
      </Text>
      {checklist.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <PressableScale
            onPress={() =>
              setChecklist((items) =>
                items.map((i) =>
                  i.id === item.id ? { ...i, done: !i.done } : i,
                ),
              )
            }
          >
            <Ionicons
              name={item.done ? "checkbox" : "square-outline"}
              size={20}
              color={item.done ? theme.success : theme.textMuted}
            />
          </PressableScale>
          <Text
            style={[
              typography.body,
              styles.itemText,
              {
                color: theme.text,
                textDecorationLine: item.done ? "line-through" : "none",
              },
            ]}
          >
            {item.text}
          </Text>
          <PressableScale
            onPress={() =>
              setChecklist((items) => items.filter((i) => i.id !== item.id))
            }
          >
            <Ionicons name="close" size={18} color={theme.textMuted} />
          </PressableScale>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Adicionar item ao checklist"
          placeholderTextColor={theme.textMuted}
          style={inlineInputStyle}
          onSubmitEditing={addChecklistItem}
          returnKeyType="done"
          accessibilityLabel="Novo item do checklist"
        />
        <PressableScale onPress={addChecklistItem}>
          <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
        </PressableScale>
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        LINKS E ANEXOS
      </Text>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.itemRow}>
          <Ionicons name="link" size={18} color={theme.info} />
          <Text
            style={[typography.body, styles.itemText, { color: theme.info }]}
            numberOfLines={1}
          >
            {attachment.label}
          </Text>
          <PressableScale
            onPress={() =>
              setAttachments((items) =>
                items.filter((i) => i.id !== attachment.id),
              )
            }
          >
            <Ionicons name="close" size={18} color={theme.textMuted} />
          </PressableScale>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput
          value={newLink}
          onChangeText={setNewLink}
          placeholder="Colar link (Moodle, SUAP, PDF...)"
          placeholderTextColor={theme.textMuted}
          style={inlineInputStyle}
          onSubmitEditing={addLink}
          autoCapitalize="none"
          keyboardType="url"
          returnKeyType="done"
          accessibilityLabel="Novo link"
        />
        <PressableScale onPress={addLink}>
          <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
        </PressableScale>
      </View>

      <ReminderPicker selected={reminders} onChange={setReminders} />

      <Field
        label="Observações"
        value={observations}
        onChangeText={setObservations}
        placeholder="Notas adicionais"
        multiline
      />

      {existing ? (
        <PressableScale
          onPress={() => {
            deleteActivity(existing.id);
            navigation.goBack();
          }}
        >
          <View style={[styles.deleteButton, { backgroundColor: `${theme.danger}18` }]}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[typography.body, { color: theme.danger, fontWeight: "700" }]}>
              Excluir atividade
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  itemText: { flex: 1 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  inlineInput: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
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
