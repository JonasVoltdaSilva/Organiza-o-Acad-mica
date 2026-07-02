import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useApp } from "../../providers/AppProvider";
import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Chip } from "../ui/Chip";

interface DisciplinePickerProps {
  selectedId: string | null;
  onChange: (disciplineId: string) => void;
}

export function DisciplinePicker({ selectedId, onChange }: DisciplinePickerProps) {
  const theme = useTheme();
  const { state } = useApp();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        DISCIPLINA
      </Text>
      {state.disciplines.length === 0 ? (
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          Cadastre uma disciplina primeiro.
        </Text>
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
});
