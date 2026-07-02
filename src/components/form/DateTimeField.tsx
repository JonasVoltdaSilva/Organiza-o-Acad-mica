import { format, isValid, parse } from "date-fns";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";

interface DateTimeFieldProps {
  label: string;
  /** valor atual em ISO (ou null) */
  valueISO: string | null;
  onChange: (iso: string | null) => void;
}

function maskDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTime(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  let hours = digits.slice(0, 2);
  if (hours.length === 2 && Number(hours) > 23) hours = "23";
  if (digits.length <= 2) return hours;
  let minutes = digits.slice(2);
  if (minutes.length === 2 && Number(minutes) > 59) minutes = "59";
  return `${hours}:${minutes}`;
}

/** Campo de data e hora com máscara dd/mm/aaaa · hh:mm. */
export function DateTimeField({ label, valueISO, onChange }: DateTimeFieldProps) {
  const theme = useTheme();
  const initial = valueISO ? new Date(valueISO) : null;
  const [dateText, setDateText] = useState(
    initial ? format(initial, "dd/MM/yyyy") : "",
  );
  const [timeText, setTimeText] = useState(
    initial ? format(initial, "HH:mm") : "",
  );

  const emit = (d: string, t: string) => {
    const parsed = parse(
      `${d} ${t || "23:59"}`,
      "dd/MM/yyyy HH:mm",
      new Date(),
    );
    onChange(d.length === 10 && isValid(parsed) ? parsed.toISOString() : null);
  };

  const inputStyle = [
    typography.body,
    styles.input,
    {
      color: theme.text,
      backgroundColor: theme.surfaceStrong,
      borderColor: theme.surfaceBorder,
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        {label.toUpperCase()}
      </Text>
      <View style={styles.row}>
        <TextInput
          value={dateText}
          onChangeText={(text) => {
            const masked = maskDate(text);
            setDateText(masked);
            emit(masked, timeText);
          }}
          placeholder="dd/mm/aaaa"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          maxLength={10}
          accessibilityLabel={`${label} — data`}
          style={[inputStyle, styles.dateInput]}
        />
        <TextInput
          value={timeText}
          onChangeText={(text) => {
            const masked = maskTime(text);
            setTimeText(masked);
            emit(dateText, masked);
          }}
          placeholder="hh:mm"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          maxLength={5}
          accessibilityLabel={`${label} — horário`}
          style={[inputStyle, styles.timeInput]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs, marginLeft: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  dateInput: { flex: 3 },
  timeInput: { flex: 2 },
});
