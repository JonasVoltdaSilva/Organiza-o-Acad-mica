import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActivityRow } from "../components/cards/ActivityRow";
import { ExamCard } from "../components/cards/ExamCard";
import { NextDeadlineCard } from "../components/cards/NextDeadlineCard";
import { AttendanceSection } from "../components/hub/AttendanceSection";
import { GoalsSection } from "../components/hub/GoalsSection";
import { GradesSection } from "../components/hub/GradesSection";
import { EmptyState } from "../components/ui/EmptyState";
import { GlassCard } from "../components/ui/GlassCard";
import { PressableScale } from "../components/ui/PressableScale";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useDisciplineHub } from "../hooks/useDisciplineHub";
import { RootNavigation, RootStackParamList } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { confirmAction } from "../utils/confirm";
import { formatShortDate } from "../utils/dates";

type HubRoute = RouteProp<RootStackParamList, "DisciplineHub">;

/**
 * Hub da Disciplina — o mini ambiente acadêmico de cada matéria.
 * Tudo o que o estudante precisa para acompanhar a disciplina está aqui.
 */
export function DisciplineHubScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<HubRoute>();
  const { toggleActivityCompleted, deleteActivity, deleteDiscipline } = useApp();
  const hub = useDisciplineHub(route.params.disciplineId);

  if (!hub) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Disciplina não encontrada" />
      </Screen>
    );
  }

  const { discipline } = hub;

  const confirmDelete = () => {
    confirmAction(
      "Excluir disciplina",
      `Excluir "${discipline.name}" e todos os dados relacionados?`,
      "Excluir",
      () => {
        deleteDiscipline(discipline.id);
        navigation.goBack();
      },
    );
  };

  return (
    <Screen>
      <View style={styles.navRow}>
        <PressableScale onPress={() => navigation.goBack()}>
          <View style={[styles.navButton, { backgroundColor: theme.surfaceStrong }]}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </View>
        </PressableScale>
        <View style={styles.navActions}>
          <PressableScale
            onPress={() =>
              navigation.navigate("DisciplineForm", {
                disciplineId: discipline.id,
              })
            }
          >
            <View style={[styles.navButton, { backgroundColor: theme.surfaceStrong }]}>
              <Ionicons name="pencil" size={17} color={theme.text} />
            </View>
          </PressableScale>
          <PressableScale onPress={confirmDelete}>
            <View style={[styles.navButton, { backgroundColor: theme.surfaceStrong }]}>
              <Ionicons name="trash-outline" size={17} color={theme.danger} />
            </View>
          </PressableScale>
        </View>
      </View>

      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: `${discipline.color}1F` }]}>
          <Ionicons
            name={discipline.icon as keyof typeof Ionicons.glyphMap}
            size={30}
            color={discipline.color}
          />
        </View>
        <Text style={[typography.largeTitle, { color: theme.text }]}>
          {discipline.name}
        </Text>
        <Text style={[typography.caption, { color: theme.textSecondary }]}>
          {[
            discipline.professor,
            `${discipline.workloadHours}h`,
            discipline.semester,
            discipline.room ? `Sala ${discipline.room}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {discipline.observations ? (
          <Text style={[typography.caption, styles.observations, { color: theme.textMuted }]}>
            {discipline.observations}
          </Text>
        ) : null}
      </View>

      {hub.nextDeadline ? (
        <View style={styles.heroWrap}>
          <NextDeadlineCard
            kind={hub.nextDeadline.kind}
            title={hub.nextDeadline.title}
            dateISO={hub.nextDeadline.dateISO}
          />
        </View>
      ) : null}

      <SectionHeader
        title={`Atividades (${hub.pendingActivities.length})`}
        actionLabel="Nova"
        onAction={() =>
          navigation.navigate("ActivityForm", { disciplineId: discipline.id })
        }
      />
      {hub.pendingActivities.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Nenhuma atividade pendente"
        />
      ) : (
        hub.pendingActivities.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            onToggle={() => toggleActivityCompleted(activity.id)}
            onDelete={() => deleteActivity(activity.id)}
            onPress={() =>
              navigation.navigate("ActivityForm", { activityId: activity.id })
            }
          />
        ))
      )}
      {hub.completedActivities.length > 0 ? (
        <>
          <Text style={[typography.micro, styles.completedLabel, { color: theme.textMuted }]}>
            CONCLUÍDAS ({hub.completedActivities.length})
          </Text>
          {hub.completedActivities.slice(0, 5).map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onToggle={() => toggleActivityCompleted(activity.id)}
              onDelete={() => deleteActivity(activity.id)}
              onPress={() =>
                navigation.navigate("ActivityForm", { activityId: activity.id })
              }
            />
          ))}
        </>
      ) : null}

      <SectionHeader
        title={`Provas (${hub.upcomingExams.length})`}
        actionLabel="Nova"
        onAction={() =>
          navigation.navigate("ExamForm", { disciplineId: discipline.id })
        }
      />
      {hub.upcomingExams.length === 0 ? (
        <EmptyState icon="document-text-outline" title="Nenhuma prova agendada" />
      ) : (
        hub.upcomingExams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onPress={() => navigation.navigate("ExamForm", { examId: exam.id })}
          />
        ))
      )}

      <SectionHeader title="Notas" />
      <GradesSection
        discipline={discipline}
        assessments={hub.assessments}
        grades={hub.grades}
      />

      <SectionHeader title="Frequência" />
      <AttendanceSection
        discipline={discipline}
        absences={hub.absences}
        attendance={hub.attendance}
      />

      <SectionHeader
        title={`Anotações (${hub.notes.length})`}
        actionLabel="Nova"
        onAction={() =>
          navigation.navigate("NoteEditor", { disciplineId: discipline.id })
        }
      />
      {hub.notes.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="Nenhuma anotação"
          subtitle="Guarde resumos, links e observações desta matéria."
        />
      ) : (
        hub.notes.slice(0, 6).map((note) => (
          <PressableScale
            key={note.id}
            onPress={() =>
              navigation.navigate("NoteEditor", {
                noteId: note.id,
                disciplineId: discipline.id,
              })
            }
            style={styles.noteItem}
          >
            <GlassCard padding={spacing.lg}>
              <View style={styles.noteRow}>
                {note.pinned ? (
                  <Ionicons name="pin" size={14} color={discipline.color} />
                ) : null}
                <View style={styles.noteBody}>
                  <Text
                    style={[typography.body, { color: theme.text, fontWeight: "600" }]}
                    numberOfLines={1}
                  >
                    {note.title || "Sem título"}
                  </Text>
                  {note.body ? (
                    <Text
                      style={[typography.caption, { color: theme.textMuted }]}
                      numberOfLines={2}
                    >
                      {note.body}
                    </Text>
                  ) : null}
                </View>
                <Text style={[typography.micro, { color: theme.textMuted }]}>
                  {formatShortDate(note.updatedAt)}
                </Text>
              </View>
            </GlassCard>
          </PressableScale>
        ))
      )}

      <SectionHeader title="Objetivos" />
      <GoalsSection
        discipline={discipline}
        goalProgress={hub.goalProgress}
        studyMinutes={hub.studyMinutes}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  navActions: { flexDirection: "row", gap: spacing.sm },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { gap: 4, marginBottom: spacing.xl },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  observations: { marginTop: spacing.xs },
  heroWrap: { marginBottom: spacing.xs },
  completedLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  noteItem: { marginBottom: spacing.md },
  noteRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  noteBody: { flex: 1, gap: 2 },
});
