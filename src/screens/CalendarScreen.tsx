import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActivityRow } from "../components/cards/ActivityRow";
import { ExamCard } from "../components/cards/ExamCard";
import { EmptyState } from "../components/ui/EmptyState";
import { GlassCard } from "../components/ui/GlassCard";
import { PressableScale } from "../components/ui/PressableScale";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { FIXED_HOLIDAYS, WEEKDAY_SHORT } from "../constants";
import { RootNavigation } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";

function holidayName(date: Date): string | null {
  const holiday = FIXED_HOLIDAYS.find(
    (h) => h.day === date.getDate() && h.month === date.getMonth() + 1,
  );
  return holiday ? holiday.name : null;
}

export function CalendarScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const { state, toggleActivityCompleted, deleteActivity } = useApp();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
      }),
    [month],
  );

  const disciplineOf = (id: string) =>
    state.disciplines.find((d) => d.id === id);

  const dotsFor = (day: Date): string[] => {
    const colors = new Set<string>();
    for (const activity of state.activities) {
      if (!activity.completed && isSameDay(new Date(activity.dueISO), day)) {
        colors.add(disciplineOf(activity.disciplineId)?.color ?? theme.primary);
      }
    }
    for (const exam of state.exams) {
      if (isSameDay(new Date(exam.dateISO), day)) {
        colors.add(disciplineOf(exam.disciplineId)?.color ?? theme.info);
      }
    }
    if (holidayName(day)) colors.add(theme.warning);
    return Array.from(colors).slice(0, 3);
  };

  const dayActivities = state.activities.filter((a) =>
    isSameDay(new Date(a.dueISO), selected),
  );
  const dayExams = state.exams.filter((e) =>
    isSameDay(new Date(e.dateISO), selected),
  );
  const selectedHoliday = holidayName(selected);

  return (
    <Screen>
      <Text style={[typography.largeTitle, styles.title, { color: theme.text }]}>
        Calendário
      </Text>

      <GlassCard padding={spacing.lg}>
        <View style={styles.monthRow}>
          <PressableScale onPress={() => setMonth((m) => addMonths(m, -1))}>
            <View style={[styles.monthButton, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="chevron-back" size={18} color={theme.primary} />
            </View>
          </PressableScale>
          <Text style={[typography.heading, styles.monthLabel, { color: theme.text }]}>
            {format(month, "MMMM yyyy", { locale: ptBR })}
          </Text>
          <PressableScale onPress={() => setMonth((m) => addMonths(m, 1))}>
            <View style={[styles.monthButton, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </View>
          </PressableScale>
        </View>

        <View style={styles.weekHeader}>
          {WEEKDAY_SHORT.map((label, index) => (
            <Text
              key={index}
              style={[typography.micro, styles.weekHeaderCell, { color: theme.textMuted }]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const inMonth = isSameMonth(day, month);
            const isSelected = isSameDay(day, selected);
            const today = isToday(day);
            const dots = dotsFor(day);
            return (
              <PressableScale
                key={day.toISOString()}
                onPress={() => setSelected(day)}
                haptic={null}
                style={styles.cellWrap}
              >
                <View
                  style={[
                    styles.cell,
                    isSelected && { backgroundColor: theme.accent },
                    !isSelected && today && { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: isSelected
                          ? theme.accentText
                          : inMonth
                            ? theme.text
                            : theme.textMuted,
                        fontWeight: today || isSelected ? "800" : "500",
                      },
                    ]}
                  >
                    {format(day, "d")}
                  </Text>
                  <View style={styles.dotsRow}>
                    {dots.map((color, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isSelected
                              ? theme.accentText
                              : color,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </GlassCard>

      <SectionHeader
        title={format(selected, "dd 'de' MMMM", { locale: ptBR })}
      />

      {selectedHoliday ? (
        <GlassCard padding={spacing.lg} style={styles.holidayCard}>
          <View style={styles.holidayRow}>
            <Ionicons name="sunny" size={18} color={theme.warning} />
            <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
              {selectedHoliday}
            </Text>
          </View>
        </GlassCard>
      ) : null}

      {dayActivities.length === 0 && dayExams.length === 0 && !selectedHoliday ? (
        <EmptyState icon="calendar-clear-outline" title="Nada neste dia" />
      ) : (
        <>
          {dayExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              discipline={disciplineOf(exam.disciplineId)}
              onPress={() => navigation.navigate("ExamForm", { examId: exam.id })}
            />
          ))}
          {dayActivities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              discipline={disciplineOf(activity.disciplineId)}
              onToggle={() => toggleActivityCompleted(activity.id)}
              onDelete={() => deleteActivity(activity.id)}
              onPress={() =>
                navigation.navigate("ActivityForm", { activityId: activity.id })
              }
            />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.xl },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { textTransform: "capitalize" },
  weekHeader: { flexDirection: "row", marginBottom: spacing.sm },
  weekHeaderCell: { flex: 1, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: `${100 / 7}%` },
  cell: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: radius.sm,
    gap: 2,
    minHeight: 44,
  },
  dotsRow: { flexDirection: "row", gap: 3, minHeight: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  holidayCard: { marginBottom: spacing.md },
  holidayRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
