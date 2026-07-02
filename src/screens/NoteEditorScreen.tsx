import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { FormSheet } from "../components/form/FormSheet";
import { Field } from "../components/ui/Field";
import { PressableScale } from "../components/ui/PressableScale";
import { RootStackParamList } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { Attachment, ChecklistItem } from "../types";
import { createId } from "../utils/id";

type EditorRoute = RouteProp<RootStackParamList, "NoteEditor">;

export function NoteEditorScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EditorRoute>();
  const { state, upsertNote, deleteNote } = useApp();

  const existing = state.notes.find((n) => n.id === route.params?.noteId);
  const disciplineId = existing?.disciplineId ?? route.params.disciplineId;
  const discipline = state.disciplines.find((d) => d.id === disciplineId);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    existing?.checklist ?? [],
  );
  const [newItem, setNewItem] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>(
    existing?.attachments ?? [],
  );
  const [newLink, setNewLink] = useState("");

  const valid = title.trim().length > 0 || body.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const now = new Date().toISOString();
    upsertNote({
      id: existing?.id ?? createId(),
      disciplineId,
      title: title.trim(),
      body,
      checklist,
      attachments,
      pinned,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
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
      title={discipline ? `Nota · ${discipline.name}` : "Anotação"}
      onSave={save}
      saveEnabled={valid}
    >
      <View style={styles.pinRow}>
        <PressableScale onPress={() => setPinned((p) => !p)}>
          <View
            style={[
              styles.pinButton,
              {
                backgroundColor: pinned
                  ? `${discipline?.color ?? theme.primary}22`
                  : theme.surfaceStrong,
              },
            ]}
          >
            <Ionicons
              name={pinned ? "pin" : "pin-outline"}
              size={16}
              color={pinned ? (discipline?.color ?? theme.primary) : theme.textMuted}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: pinned
                    ? (discipline?.color ?? theme.primary)
                    : theme.textMuted,
                  fontWeight: "600",
                },
              ]}
            >
              {pinned ? "Fixada" : "Fixar"}
            </Text>
          </View>
        </PressableScale>
      </View>

      <Field
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Título da anotação"
        autoFocus={!existing}
      />
      <Field
        label="Conteúdo"
        value={body}
        onChangeText={setBody}
        placeholder="Escreva resumos, fórmulas, trechos de código, observações..."
        multiline
      />

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
          placeholder="Adicionar item"
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
        LINKS E ARQUIVOS
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
          placeholder="Colar link"
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

      {existing ? (
        <PressableScale
          onPress={() => {
            deleteNote(existing.id);
            navigation.goBack();
          }}
        >
          <View style={[styles.deleteButton, { backgroundColor: `${theme.danger}18` }]}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[typography.body, { color: theme.danger, fontWeight: "700" }]}>
              Excluir anotação
            </Text>
          </View>
        </PressableScale>
      ) : null}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  pinRow: { flexDirection: "row", marginBottom: spacing.lg },
  pinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
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
