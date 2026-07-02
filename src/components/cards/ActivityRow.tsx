import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PRIORITIES } from "../../constants";
import { Activity, Discipline } from "../../types";
import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { deadlineLabel, isOverdue } from "../../utils/dates";
import { GlassCard } from "../ui/GlassCard";
import { PressableScale } from "../ui/PressableScale";
import { SwipeableRow } from "../ui/SwipeableRow";

interface ActivityRowProps {
  activity: Activity;
  discipline?: Discipline;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export function ActivityRow({
  activity,
  discipline,
  onToggle,
  onPress,
  onDelete,
}: ActivityRowProps) {
  const theme = useTheme();
  const priority = PRIORITIES.find((p) => p.value === activity.priority);
  const overdue = !activity.completed && isOverdue(activity.dueISO);
  const checklistDone = activity.checklist.filter((c) => c.done).length;

  return (
    <SwipeableRow onSwipeRight={onToggle} onSwipeLeft={onDelete}>
      <PressableScale onPress={onPress} style={styles.wrap}>
        <GlassCard padding={spacing.lg}>
          <View style={styles.row}>
            <PressableScale
              onPress={onToggle}
              haptic={Haptics.ImpactFeedbackStyle.Medium}
            >
              <Ionicons
                name={activity.completed ? "checkmark-circle" : "ellipse-outline"}
                size={26}
                color={activity.completed ? theme.success : theme.textMuted}
              />
            </PressableScale>

            <View style={styles.body}>
              <Text
                style={[
                  typography.body,
                  styles.title,
                  {
                    color: theme.text,
                    textDecorationLine: activity.completed
                      ? "line-through"
                      : "none",
                    opacity: activity.completed ? 0.55 : 1,
                  },
                ]}
                numberOfLines={1}
              >
                {activity.title}
              </Text>
              <View style={styles.metaRow}>
                {discipline ? (
                  <View
                    style={[styles.dot, { backgroundColor: discipline.color }]}
                  />
                ) : null}
                <Text
                  style={[
                    typography.caption,
                    {
                      color: overdue ? theme.warning : theme.textSecondary,
                      fontWeight: overdue ? "700" : "500",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {discipline ? `${discipline.name} · ` : ""}
                  {activity.completed ? "Concluída" : deadlineLabel(activity.dueISO)}
                </Text>
              </View>
              {activity.checklist.length > 0 ? (
                <Text style={[typography.micro, { color: theme.textMuted }]}>
                  ☑ {checklistDone}/{activity.checklist.length} itens
                </Text>
              ) : null}
            </View>

            {priority && !activity.completed ? (
              <View
                style={[styles.priority, { backgroundColor: priority.color }]}
                accessibilityLabel={`Prioridade ${priority.label}`}
              />
            ) : null}
          </View>
        </GlassCard>
      </PressableScale>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  body: { flex: 1, gap: 3 },
  title: { fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priority: { width: 10, height: 10, borderRadius: 5 },
});
