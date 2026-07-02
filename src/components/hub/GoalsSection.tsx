import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useApp } from "../../providers/AppProvider";
import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { Discipline, Goal, GoalType } from "../../types";
import { GoalProgress } from "../../hooks/useDisciplineHub";
import { createId } from "../../utils/id";
import { GlassCard } from "../ui/GlassCard";
import { Chip } from "../ui/Chip";
import { PressableScale } from "../ui/PressableScale";
import { ProgressBar } from "../ui/ProgressBar";

interface GoalsSectionProps {
  discipline: Discipline;
  goalProgress: GoalProgress[];
  studyMinutes: number;
}

const GOAL_TEMPLATES: { type: GoalType; label: string; target: number }[] = [
  { type: "media", label: "Média 8,0", target: 8 },
  { type: "frequencia", label: "Frequência 90%", target: 90 },
  { type: "horas_estudo", label: "Estudar 20h", target: 20 },
  { type: "atividades_no_prazo", label: "Tudo no prazo", target: 100 },
];

/** Metas da disciplina com progresso visual + registro de horas de estudo. */
export function GoalsSection({
  discipline,
  goalProgress,
  studyMinutes,
}: GoalsSectionProps) {
  const theme = useTheme();
  const { upsertDiscipline, addStudySession } = useApp();

  const addGoal = (template: (typeof GOAL_TEMPLATES)[number]) => {
    const goal: Goal = {
      id: createId(),
      type: template.type,
      target: template.target,
    };
    upsertDiscipline({ ...discipline, goals: [...discipline.goals, goal] });
  };

  const removeGoal = (goalId: string) => {
    upsertDiscipline({
      ...discipline,
      goals: discipline.goals.filter((g) => g.id !== goalId),
    });
  };

  const logStudy = (minutes: number) => {
    addStudySession({
      id: createId(),
      disciplineId: discipline.id,
      dateISO: new Date().toISOString(),
      minutes,
    });
  };

  const availableTemplates = GOAL_TEMPLATES.filter(
    (t) => !discipline.goals.some((g) => g.type === t.type),
  );

  return (
    <GlassCard>
      {goalProgress.length === 0 ? (
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          Defina metas para acompanhar seu desempenho nesta disciplina.
        </Text>
      ) : (
        goalProgress.map(({ goal, label, progress, achieved }) => (
          <View key={goal.id} style={styles.goalRow}>
            <View style={styles.goalHeader}>
              <Ionicons
                name={achieved ? "trophy" : "flag-outline"}
                size={16}
                color={achieved ? theme.accent : theme.textSecondary}
              />
              <Text
                style={[typography.body, styles.goalLabel, { color: theme.text }]}
              >
                {label}
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {Math.round(progress * 100)}%
              </Text>
              <PressableScale onPress={() => removeGoal(goal.id)}>
                <Ionicons name="close" size={16} color={theme.textMuted} />
              </PressableScale>
            </View>
            <ProgressBar
              progress={progress}
              color={achieved ? theme.success : discipline.color}
              height={6}
            />
          </View>
        ))
      )}

      {availableTemplates.length > 0 ? (
        <View style={styles.templates}>
          {availableTemplates.map((template) => (
            <Chip
              key={template.type}
              label={`+ ${template.label}`}
              onPress={() => addGoal(template)}
            />
          ))}
        </View>
      ) : null}

      <View style={[styles.studyRow, { borderTopColor: theme.surfaceBorder }]}>
        <View style={styles.studyInfo}>
          <Text style={[typography.body, { color: theme.text, fontWeight: "700" }]}>
            {Math.floor(studyMinutes / 60)}h{studyMinutes % 60 > 0 ? ` ${studyMinutes % 60}min` : ""}
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            HORAS ESTUDADAS
          </Text>
        </View>
        <View style={styles.studyButtons}>
          {[30, 60].map((minutes) => (
            <PressableScale key={minutes} onPress={() => logStudy(minutes)}>
              <View style={[styles.studyButton, { backgroundColor: theme.primarySoft }]}>
                <Text
                  style={[typography.caption, { color: theme.primary, fontWeight: "700" }]}
                >
                  +{minutes === 60 ? "1h" : `${minutes}min`}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  goalRow: { marginBottom: spacing.lg, gap: spacing.sm },
  goalHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  goalLabel: { flex: 1, fontWeight: "600" },
  templates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  studyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  studyInfo: { gap: 2 },
  studyButtons: { flexDirection: "row", gap: spacing.sm },
  studyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minHeight: 36,
    justifyContent: "center",
  },
});
