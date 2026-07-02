import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Discipline, Exam } from "../../types";
import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import {
  countdownLabel,
  daysUntil,
  formatShortDate,
  formatTime,
} from "../../utils/dates";
import { GlassCard } from "../ui/GlassCard";
import { PressableScale } from "../ui/PressableScale";

interface ExamCardProps {
  exam: Exam;
  discipline?: Discipline;
  onPress: () => void;
}

export function ExamCard({ exam, discipline, onPress }: ExamCardProps) {
  const theme = useTheme();
  const days = daysUntil(exam.dateISO);
  const urgent = days <= 3;
  const accent = discipline?.color ?? theme.info;

  return (
    <PressableScale onPress={onPress} style={styles.wrap}>
      <GlassCard padding={spacing.lg}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <Ionicons name="document-text-outline" size={22} color={accent} />
          </View>
          <View style={styles.body}>
            {discipline ? (
              <Text
                style={[typography.micro, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {discipline.name.toUpperCase()}
              </Text>
            ) : null}
            <Text
              style={[typography.body, styles.title, { color: theme.text }]}
              numberOfLines={1}
            >
              {exam.content}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              {formatShortDate(exam.dateISO)} às {formatTime(exam.dateISO)}
              {exam.location ? ` · ${exam.location}` : ""}
            </Text>
          </View>
          <View
            style={[
              styles.countdown,
              {
                backgroundColor: urgent ? theme.danger : theme.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                typography.micro,
                { color: urgent ? "#FFFFFF" : theme.primary },
              ]}
            >
              {countdownLabel(exam.dateISO)}
            </Text>
          </View>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontWeight: "700" },
  countdown: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
});
