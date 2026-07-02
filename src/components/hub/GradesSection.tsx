import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useApp } from "../../providers/AppProvider";
import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Assessment, Discipline } from "../../types";
import { GradeSummary, formatGrade } from "../../utils/grades";
import { createId } from "../../utils/id";
import { GlassCard } from "../ui/GlassCard";
import { PressableScale } from "../ui/PressableScale";

interface GradesSectionProps {
  discipline: Discipline;
  assessments: Assessment[];
  grades: GradeSummary;
}

/** Notas: média atual, situação, quanto falta e lançamento de avaliações. */
export function GradesSection({
  discipline,
  assessments,
  grades,
}: GradesSectionProps) {
  const theme = useTheme();
  const { upsertAssessment, deleteAssessment } = useApp();
  const [newName, setNewName] = useState("");

  const situationColor =
    grades.situation === "aprovado"
      ? theme.success
      : grades.situation === "reprovado"
        ? theme.danger
        : grades.situation === "em_recuperacao"
          ? theme.warning
          : theme.info;

  const setGrade = (assessment: Assessment, text: string) => {
    const normalized = text.replace(",", ".").trim();
    const value = normalized === "" ? null : Number(normalized);
    if (value !== null && (Number.isNaN(value) || value < 0)) return;
    upsertAssessment({
      ...assessment,
      grade:
        value === null
          ? null
          : Math.min(discipline.evaluation.maxGrade, value),
    });
  };

  const setWeight = (assessment: Assessment, text: string) => {
    const value = Number(text.replace(",", "."));
    if (Number.isNaN(value) || value <= 0) return;
    upsertAssessment({ ...assessment, weight: value });
  };

  const addAssessment = () => {
    if (!newName.trim()) return;
    upsertAssessment({
      id: createId(),
      disciplineId: discipline.id,
      name: newName.trim(),
      weight: 1,
      grade: null,
    });
    setNewName("");
  };

  const inputStyle = [
    typography.body,
    styles.gradeInput,
    {
      color: theme.text,
      backgroundColor: theme.surfaceStrong,
      borderColor: theme.surfaceBorder,
    },
  ];

  return (
    <GlassCard>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[typography.title, { color: theme.text }]}>
            {formatGrade(grades.partialAverage)}
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            MÉDIA ATUAL
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[typography.title, { color: theme.text }]}>
            {grades.neededOnRemaining !== null
              ? formatGrade(Math.min(grades.neededOnRemaining, 99))
              : "–"}
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            PRECISA TIRAR
          </Text>
        </View>
        <View
          style={[styles.situation, { backgroundColor: `${situationColor}22` }]}
        >
          <Text
            style={[typography.caption, { color: situationColor, fontWeight: "700" }]}
          >
            {grades.situationLabel}
          </Text>
        </View>
      </View>

      {grades.neededOnRemaining !== null &&
      grades.neededOnRemaining > discipline.evaluation.maxGrade ? (
        <Text style={[typography.caption, styles.alert, { color: theme.danger }]}>
          ⚠ Mesmo com nota máxima nas próximas avaliações, a média{" "}
          {discipline.evaluation.passingGrade.toFixed(1).replace(".", ",")} não
          será atingida.
        </Text>
      ) : null}

      {assessments.map((assessment) => (
        <View key={assessment.id} style={styles.assessmentRow}>
          <Text
            style={[typography.body, styles.assessmentName, { color: theme.text }]}
            numberOfLines={1}
          >
            {assessment.name}
          </Text>
          {discipline.evaluation.mode === "ponderada" ? (
            <TextInput
              defaultValue={String(assessment.weight)}
              onEndEditing={(e) => setWeight(assessment, e.nativeEvent.text)}
              keyboardType="decimal-pad"
              accessibilityLabel={`Peso de ${assessment.name}`}
              style={inputStyle}
              placeholder="peso"
              placeholderTextColor={theme.textMuted}
            />
          ) : null}
          <TextInput
            defaultValue={
              assessment.grade !== null
                ? assessment.grade.toFixed(1).replace(".", ",")
                : ""
            }
            onEndEditing={(e) => setGrade(assessment, e.nativeEvent.text)}
            keyboardType="decimal-pad"
            accessibilityLabel={`Nota de ${assessment.name}`}
            style={inputStyle}
            placeholder="nota"
            placeholderTextColor={theme.textMuted}
          />
          <PressableScale onPress={() => deleteAssessment(assessment.id)}>
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </PressableScale>
        </View>
      ))}

      <View style={styles.addRow}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Nova avaliação (ex.: Prova 1, Trabalho)"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Nome da nova avaliação"
          style={[
            typography.body,
            styles.addInput,
            {
              color: theme.text,
              backgroundColor: theme.surfaceStrong,
              borderColor: theme.surfaceBorder,
            },
          ]}
          onSubmitEditing={addAssessment}
          returnKeyType="done"
        />
        <PressableScale onPress={addAssessment}>
          <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
        </PressableScale>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryItem: { gap: 2 },
  situation: {
    marginLeft: "auto",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  alert: { marginBottom: spacing.md },
  assessmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  assessmentName: { flex: 1, fontWeight: "600" },
  gradeInput: {
    width: 64,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    textAlign: "center",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addInput: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
