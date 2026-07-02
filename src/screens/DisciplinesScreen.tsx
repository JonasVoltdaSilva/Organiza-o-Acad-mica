import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { DisciplineCard } from "../components/cards/DisciplineCard";
import { EmptyState } from "../components/ui/EmptyState";
import { FAB } from "../components/ui/FAB";
import { Screen } from "../components/ui/Screen";
import { RootNavigation } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { summarizeAttendance } from "../utils/attendance";
import { summarizeGrades } from "../utils/grades";

export function DisciplinesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const { state } = useApp();

  return (
    <View style={styles.fill}>
      <Screen>
        <Text
          style={[typography.largeTitle, styles.title, { color: theme.text }]}
        >
          Disciplinas
        </Text>
        <Text
          style={[typography.caption, styles.subtitle, { color: theme.textSecondary }]}
        >
          {state.disciplines.length === 0
            ? "Monte seu semestre cadastrando suas matérias"
            : `${state.disciplines.length} disciplina${state.disciplines.length > 1 ? "s" : ""} neste semestre`}
        </Text>

        {state.disciplines.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="Nenhuma disciplina ainda"
            subtitle="Toque no botão + para adicionar sua primeira disciplina."
          />
        ) : (
          state.disciplines.map((discipline) => {
            const pending = state.activities.filter(
              (a) => a.disciplineId === discipline.id && !a.completed,
            ).length;
            const attendance = summarizeAttendance(
              discipline.workloadHours,
              state.absences.filter((a) => a.disciplineId === discipline.id),
            );
            const grades = summarizeGrades(
              state.assessments.filter((a) => a.disciplineId === discipline.id),
              discipline.evaluation,
            );
            return (
              <DisciplineCard
                key={discipline.id}
                discipline={discipline}
                pendingCount={pending}
                attendance={attendance}
                average={grades.partialAverage}
                onPress={() =>
                  navigation.navigate("DisciplineHub", {
                    disciplineId: discipline.id,
                  })
                }
              />
            );
          })
        )}
      </Screen>
      <FAB onPress={() => navigation.navigate("DisciplineForm", {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: spacing.xl },
});
