import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RootNavigation } from "../../navigation/types";
import { useApp } from "../../providers/AppProvider";
import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Chip } from "../ui/Chip";
import { PressableScale } from "../ui/PressableScale";

interface DisciplinePickerProps {
  selectedId: string | null;
  onChange: (disciplineId: string) => void;
}

export function DisciplinePicker({ selectedId, onChange }: DisciplinePickerProps) {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const { state } = useApp();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        DISCIPLINA
      </Text>
      {state.disciplines.length === 0 ? (
        <PressableScale
          onPress={() => navigation.navigate("DisciplineForm", {})}
        >
          <View style={[styles.cta, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="add-circle" size={20} color={theme.primary} />
            <View style={styles.ctaText}>
              <Text
                style={[typography.body, { color: theme.primary, fontWeight: "700" }]}
              >
                Criar sua primeira disciplina
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                É necessário ter uma disciplina para salvar.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </View>
        </PressableScale>
      ) : (
        <View style={styles.chips}>
          {state.disciplines.map((discipline) => (
            <Chip
              key={discipline.id}
              label={discipline.name}
              color={discipline.color}
              selected={selectedId === discipline.id}
              onPress={() => onChange(discipline.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.sm,
  },
  ctaText: { flex: 1, gap: 2 },
});
