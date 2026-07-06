import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActivityRow } from "../components/cards/ActivityRow";
import { ExamCard } from "../components/cards/ExamCard";
import { NextDeadlineCard } from "../components/cards/NextDeadlineCard";
import { StatTile } from "../components/cards/StatTile";
import { CollapsibleList } from "../components/ui/CollapsibleList";
import { EmptyState } from "../components/ui/EmptyState";
import { GlassCard } from "../components/ui/GlassCard";
import { PressableScale } from "../components/ui/PressableScale";
import { ProgressBar } from "../components/ui/ProgressBar";
import { RiskThermometer } from "../components/ui/RiskThermometer";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useDashboard } from "../hooks/useDashboard";
import { RootNavigation } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { greeting } from "../utils/dates";

function WeekStrip() {
  const theme = useTheme();
  const { state } = useApp();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });

  return (
    <GlassCard padding={spacing.lg}>
      <View style={styles.weekRow}>
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          const isToday = isSameDay(day, today);
          const hasEvent =
            state.activities.some(
              (a) => !a.completed && isSameDay(new Date(a.dueISO), day),
            ) || state.exams.some((e) => isSameDay(new Date(e.dateISO), day));
          return (
            <View
              key={i}
              style={[styles.weekDay, isToday && { backgroundColor: theme.accent }]}
            >
              <Text
                style={[
                  typography.micro,
                  { color: isToday ? theme.accentText : theme.textMuted },
                ]}
              >
                {format(day, "EEEEEE", { locale: ptBR }).toUpperCase()}
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: isToday ? theme.accentText : theme.text,
                    fontWeight: "700",
                  },
                ]}
              >
                {format(day, "d")}
              </Text>
              <View
                style={[
                  styles.eventDot,
                  {
                    backgroundColor: hasEvent
                      ? isToday
                        ? theme.accentText
                        : theme.primary
                      : "transparent",
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

export function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const { state, toggleActivityCompleted, deleteActivity } = useApp();
  const dashboard = useDashboard();

  const disciplineOf = (id: string) =>
    state.disciplines.find((d) => d.id === id);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[typography.largeTitle, { color: theme.text }]}>
            {greeting(state.settings.userName)}
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            Semestre {state.settings.semesterLabel} ·{" "}
            {dashboard.semesterDaysLeft} dias restantes
          </Text>
        </View>
        <View style={styles.headerActions}>
          <PressableScale onPress={() => navigation.navigate("Search")}>
            <View style={[styles.iconButton, { backgroundColor: theme.surfaceStrong }]}>
              <Ionicons name="search" size={20} color={theme.text} />
            </View>
          </PressableScale>
          <PressableScale onPress={() => navigation.navigate("Settings")}>
            <View style={[styles.iconButton, { backgroundColor: theme.surfaceStrong }]}>
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </View>
          </PressableScale>
        </View>
      </View>

      {dashboard.nextDeadline ? (
        <View style={styles.heroWrap}>
          <NextDeadlineCard
            kind={dashboard.nextDeadline.kind}
            title={dashboard.nextDeadline.title}
            dateISO={dashboard.nextDeadline.dateISO}
          />
        </View>
      ) : null}

      <RiskThermometer risk={dashboard.overallRisk} size="md" style={styles.riskCard} />

      <GlassCard style={styles.semesterCard}>
        <View style={styles.semesterHeader}>
          <Text style={[typography.heading, { color: theme.text }]}>
            Progresso do semestre
          </Text>
          <Text style={[typography.heading, { color: theme.primary }]}>
            {Math.round(dashboard.semesterProgress * 100)}%
          </Text>
        </View>
        <ProgressBar progress={dashboard.semesterProgress} />
      </GlassCard>

      <View style={styles.tilesRow}>
        <StatTile
          icon="checkmark-done"
          label="Atividades concluídas"
          value={`${Math.round(dashboard.completionPercent)}%`}
        />
        <StatTile
          icon="pie-chart"
          label="Frequência média"
          value={
            dashboard.averageAttendance !== null
              ? `${Math.round(dashboard.averageAttendance)}%`
              : "–"
          }
          color={theme.info}
        />
        <StatTile
          icon="ribbon"
          label="Média geral"
          value={
            dashboard.overallAverage !== null
              ? dashboard.overallAverage.toFixed(1).replace(".", ",")
              : "–"
          }
          color="#B45FC9"
        />
        {state.settings.streakEnabled ? (
          <StatTile
            icon="flame"
            label="Streak de estudo"
            value={`${state.studyStreak.count}d`}
            color={theme.warning}
          />
        ) : null}
      </View>

      <SectionHeader title="Sua semana" />
      <WeekStrip />

      {dashboard.todayDisciplines.length > 0 ? (
        <>
          <SectionHeader title="Disciplinas de hoje" />
          {dashboard.todayDisciplines.map((discipline) => (
            <PressableScale
              key={discipline.id}
              onPress={() =>
                navigation.navigate("DisciplineHub", {
                  disciplineId: discipline.id,
                })
              }
              style={styles.todayItem}
            >
              <GlassCard padding={spacing.lg}>
                <View style={styles.todayRow}>
                  <View
                    style={[styles.todayDot, { backgroundColor: discipline.color }]}
                  />
                  <Text
                    style={[typography.body, styles.todayName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {discipline.name}
                  </Text>
                  {discipline.room ? (
                    <Text style={[typography.caption, { color: theme.textMuted }]}>
                      Sala {discipline.room}
                    </Text>
                  ) : null}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.textMuted}
                  />
                </View>
              </GlassCard>
            </PressableScale>
          ))}
        </>
      ) : null}

      <SectionHeader
        title="Próximas atividades"
        actionLabel="Nova"
        onAction={() => navigation.navigate("ActivityForm", {})}
      />
      <CollapsibleList
        items={[...dashboard.overdueActivities, ...dashboard.upcomingActivities]}
        keyExtractor={(activity) => activity.id}
        emptyState={
          <EmptyState
            icon="sparkles"
            title="Nenhuma atividade pendente"
            subtitle="Você está em dia. Aproveite para revisar o conteúdo!"
          />
        }
        renderItem={(activity) => (
          <ActivityRow
            activity={activity}
            discipline={disciplineOf(activity.disciplineId)}
            onToggle={() => toggleActivityCompleted(activity.id)}
            onDelete={() => deleteActivity(activity.id)}
            onPress={() =>
              navigation.navigate("ActivityForm", { activityId: activity.id })
            }
          />
        )}
      />

      <SectionHeader
        title="Próximas provas"
        actionLabel="Nova"
        onAction={() => navigation.navigate("ExamForm", {})}
      />
      <CollapsibleList
        items={dashboard.upcomingExams}
        keyExtractor={(exam) => exam.id}
        emptyState={
          <EmptyState
            icon="document-text-outline"
            title="Nenhuma prova agendada"
            subtitle="Cadastre suas provas para receber lembretes."
          />
        }
        renderItem={(exam) => (
          <ExamCard
            exam={exam}
            discipline={disciplineOf(exam.disciplineId)}
            onPress={() => navigation.navigate("ExamForm", { examId: exam.id })}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  headerText: { flex: 1, gap: 4 },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  heroWrap: { marginBottom: spacing.lg },
  riskCard: { marginBottom: spacing.lg },
  semesterCard: { marginBottom: spacing.lg, gap: spacing.md },
  semesterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tilesRow: { flexDirection: "row", gap: spacing.md },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekDay: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
  },
  eventDot: { width: 5, height: 5, borderRadius: 3 },
  todayItem: { marginBottom: spacing.md },
  todayRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  todayDot: { width: 10, height: 10, borderRadius: 5 },
  todayName: { flex: 1, fontWeight: "600" },
});
