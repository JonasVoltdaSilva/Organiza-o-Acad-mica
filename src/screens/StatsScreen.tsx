import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { StatTile } from "../components/cards/StatTile";
import { GlassCard } from "../components/ui/GlassCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useDashboard } from "../hooks/useDashboard";
import { useApp } from "../providers/AppProvider";
import { spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { summarizeAttendance } from "../utils/attendance";
import { formatGrade, summarizeGrades } from "../utils/grades";

interface DisciplineStat {
  id: string;
  name: string;
  color: string;
  activityCount: number;
  attendancePercent: number;
  average: number | null;
}

export function StatsScreen() {
  const theme = useTheme();
  const { state } = useApp();
  const dashboard = useDashboard();

  const stats = useMemo<DisciplineStat[]>(
    () =>
      state.disciplines.map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        activityCount: state.activities.filter((a) => a.disciplineId === d.id)
          .length,
        attendancePercent: summarizeAttendance(
          d.workloadHours,
          state.absences.filter((a) => a.disciplineId === d.id),
        ).attendancePercent,
        average: summarizeGrades(
          state.assessments.filter((a) => a.disciplineId === d.id),
          d.evaluation,
        ).partialAverage,
      })),
    [state],
  );

  const totalStudyMinutes = state.studySessions.reduce(
    (sum, s) => sum + s.minutes,
    0,
  );
  const completedCount = state.activities.filter((a) => a.completed).length;
  const pendingCount = state.activities.length - completedCount;

  const mostActivities = [...stats].sort(
    (a, b) => b.activityCount - a.activityCount,
  )[0];
  const lowestAttendance = [...stats].sort(
    (a, b) => a.attendancePercent - b.attendancePercent,
  )[0];
  const bestAverage = [...stats]
    .filter((s) => s.average !== null)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))[0];

  const maxActivityCount = Math.max(1, ...stats.map((s) => s.activityCount));

  return (
    <Screen>
      <Text style={[typography.largeTitle, styles.title, { color: theme.text }]}>
        Estatísticas
      </Text>

      {state.disciplines.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title="Sem dados ainda"
          subtitle="Cadastre disciplinas e atividades para ver suas estatísticas."
        />
      ) : (
        <>
          <View style={styles.tilesRow}>
            <StatTile
              icon="time"
              label="Horas estudadas"
              value={`${Math.floor(totalStudyMinutes / 60)}h`}
            />
            <StatTile
              icon="checkmark-done"
              label="Concluídas"
              value={String(completedCount)}
              color={theme.success}
            />
            <StatTile
              icon="hourglass"
              label="Pendentes"
              value={String(pendingCount)}
              color={theme.warning}
            />
          </View>

          <GlassCard style={styles.semesterCard}>
            <View style={styles.rowBetween}>
              <Text style={[typography.heading, { color: theme.text }]}>
                Semestre
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {dashboard.semesterDaysLeft} dias restantes
              </Text>
            </View>
            <ProgressBar progress={dashboard.semesterProgress} />
            <Text style={[typography.caption, { color: theme.textMuted }]}>
              {Math.round(dashboard.semesterProgress * 100)}% concluído
            </Text>
          </GlassCard>

          <SectionHeader title="Destaques" />
          <View style={styles.highlights}>
            {mostActivities && mostActivities.activityCount > 0 ? (
              <GlassCard padding={spacing.lg} style={styles.highlight}>
                <Text style={[typography.micro, { color: theme.textMuted }]}>
                  MAIS ATIVIDADES
                </Text>
                <Text
                  style={[typography.body, styles.highlightName, { color: mostActivities.color }]}
                  numberOfLines={1}
                >
                  {mostActivities.name}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {mostActivities.activityCount} atividades
                </Text>
              </GlassCard>
            ) : null}
            {lowestAttendance ? (
              <GlassCard padding={spacing.lg} style={styles.highlight}>
                <Text style={[typography.micro, { color: theme.textMuted }]}>
                  MENOR FREQUÊNCIA
                </Text>
                <Text
                  style={[typography.body, styles.highlightName, { color: lowestAttendance.color }]}
                  numberOfLines={1}
                >
                  {lowestAttendance.name}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {Math.round(lowestAttendance.attendancePercent)}% de presença
                </Text>
              </GlassCard>
            ) : null}
            {bestAverage ? (
              <GlassCard padding={spacing.lg} style={styles.highlight}>
                <Text style={[typography.micro, { color: theme.textMuted }]}>
                  MAIOR NOTA
                </Text>
                <Text
                  style={[typography.body, styles.highlightName, { color: bestAverage.color }]}
                  numberOfLines={1}
                >
                  {bestAverage.name}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  Média {formatGrade(bestAverage.average)}
                </Text>
              </GlassCard>
            ) : null}
          </View>

          <SectionHeader title="Atividades por disciplina" />
          <GlassCard>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text
                    style={[typography.caption, styles.barName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {stat.name}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {stat.activityCount}
                  </Text>
                </View>
                <ProgressBar
                  progress={stat.activityCount / maxActivityCount}
                  color={stat.color}
                  height={10}
                />
              </View>
            ))}
          </GlassCard>

          <SectionHeader title="Frequência por disciplina" />
          <GlassCard>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text
                    style={[typography.caption, styles.barName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {stat.name}
                  </Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {Math.round(stat.attendancePercent)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={stat.attendancePercent / 100}
                  color={
                    stat.attendancePercent < 75
                      ? theme.danger
                      : stat.attendancePercent < 82
                        ? theme.warning
                        : stat.color
                  }
                  height={10}
                />
              </View>
            ))}
          </GlassCard>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.xl },
  tilesRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  semesterCard: { gap: spacing.md },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  highlights: { gap: spacing.md },
  highlight: { gap: 3 },
  highlightName: { fontWeight: "700" },
  barRow: { marginBottom: spacing.lg, gap: spacing.sm },
  barHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  barName: { flex: 1, fontWeight: "600" },
});
