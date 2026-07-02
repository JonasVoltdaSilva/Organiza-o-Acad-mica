import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { REMINDER_OPTIONS } from "../../constants";
import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Chip } from "../ui/Chip";

interface ReminderPickerProps {
  selected: number[];
  onChange: (reminders: number[]) => void;
}

/** Seleção múltipla de lembretes — o usuário ativa quantos quiser. */
export function ReminderPicker({ selected, onChange }: ReminderPickerProps) {
  const theme = useTheme();

  const toggle = (minutes: number) => {
    onChange(
      selected.includes(minutes)
        ? selected.filter((m) => m !== minutes)
        : [...selected, minutes].sort((a, b) => b - a),
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        LEMBRETES
      </Text>
      <View style={styles.chips}>
        {REMINDER_OPTIONS.map((option) => (
          <Chip
            key={option.minutes}
            label={option.label}
            selected={selected.includes(option.minutes)}
            onPress={() => toggle(option.minutes)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
