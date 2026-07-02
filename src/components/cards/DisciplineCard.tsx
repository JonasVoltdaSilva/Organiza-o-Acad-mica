import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, radius, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Discipline } from "../../types";
import { AttendanceSummary } from "../../utils/attendance";
import { GlassCard } from "../ui/GlassCard";
import { PressableScale } from "../ui/PressableScale";
import { ProgressBar } from "../ui/ProgressBar";

interface DisciplineCardProps {
  discipline: Discipline;
  pendingCount: number;
  attendance: AttendanceSummary;
  average: number | null;
  onPress: () => void;
}

export function DisciplineCard({
  discipline,
  pendingCount,
  attendance,
  average,
  onPress,
}: DisciplineCardProps) {
  const theme = useTheme();

  const attendanceColor =
    attendance.status === "excedido"
      ? theme.danger
      : attendance.status === "alerta"
        ? theme.warning
        : discipline.color;

  return (
    <PressableScale onPress={onPress} style={styles.wrap}>
      <GlassCard>
        <View style={styles.header}>
          <View
            style={[styles.iconWrap, { backgroundColor: `${discipline.color}1F` }]}
          >
            <Ionicons
              name={discipline.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={discipline.color}
            />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[typography.heading, { color: theme.text }]}
              numberOfLines={1}
            >
              {discipline.name}
            </Text>
            <Text
              style={[typography.caption, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {discipline.professor || "Sem professor"} · {discipline.workloadHours}h
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[typography.heading, { color: theme.text }]}>
              {pendingCount}
            </Text>
            <Text style={[typography.micro, { color: theme.textMuted }]}>
              PENDENTES
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.heading, { color: theme.text }]}>
              {average !== null ? average.toFixed(1).replace(".", ",") : "–"}
            </Text>
            <Text style={[typography.micro, { color: theme.textMuted }]}>
              MÉDIA
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.heading, { color: attendanceColor }]}>
              {Math.round(attendance.attendancePercent)}%
            </Text>
            <Text style={[typography.micro, { color: theme.textMuted }]}>
              PRESENÇA
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={attendance.attendancePercent / 100}
          color={attendanceColor}
          height={6}
        />
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  stat: { alignItems: "center", gap: 2 },
});
