import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "../components/ui/GlassCard";
import { PressableScale } from "../components/ui/PressableScale";
import { RootNavigation } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { formatShortDate } from "../utils/dates";

interface SearchResult {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function SearchScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RootNavigation>();
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];

    const matches = (...fields: (string | undefined)[]) =>
      fields.some((f) => f?.toLowerCase().includes(term));

    const disciplineOf = (id: string) =>
      state.disciplines.find((d) => d.id === id);

    const list: SearchResult[] = [];

    for (const d of state.disciplines) {
      if (matches(d.name, d.professor, d.observations)) {
        list.push({
          key: `d-${d.id}`,
          icon: "school",
          color: d.color,
          title: d.name,
          subtitle: `Disciplina · ${d.professor || d.semester}`,
          onPress: () =>
            navigation.navigate("DisciplineHub", { disciplineId: d.id }),
        });
      }
    }
    for (const a of state.activities) {
      if (matches(a.title, a.description, a.observations)) {
        const discipline = disciplineOf(a.disciplineId);
        list.push({
          key: `a-${a.id}`,
          icon: "flag",
          color: discipline?.color ?? theme.primary,
          title: a.title,
          subtitle: `Atividade · ${discipline?.name ?? ""} · ${formatShortDate(a.dueISO)}`,
          onPress: () =>
            navigation.navigate("ActivityForm", { activityId: a.id }),
        });
      }
    }
    for (const e of state.exams) {
      if (matches(e.content, e.location, e.observations)) {
        const discipline = disciplineOf(e.disciplineId);
        list.push({
          key: `e-${e.id}`,
          icon: "document-text",
          color: discipline?.color ?? theme.info,
          title: e.content,
          subtitle: `Prova · ${discipline?.name ?? ""} · ${formatShortDate(e.dateISO)}`,
          onPress: () => navigation.navigate("ExamForm", { examId: e.id }),
        });
      }
    }
    for (const n of state.notes) {
      if (matches(n.title, n.body)) {
        const discipline = disciplineOf(n.disciplineId);
        list.push({
          key: `n-${n.id}`,
          icon: "create",
          color: discipline?.color ?? theme.textSecondary,
          title: n.title || "Sem título",
          subtitle: `Anotação · ${discipline?.name ?? ""}`,
          onPress: () =>
            navigation.navigate("NoteEditor", {
              noteId: n.id,
              disciplineId: n.disciplineId,
            }),
        });
      }
    }

    return list.slice(0, 30);
  }, [query, state, navigation, theme]);

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: theme.background, paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.surfaceStrong,
              borderColor: theme.surfaceBorder,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar disciplinas, atividades, provas, notas..."
            placeholderTextColor={theme.textMuted}
            autoFocus
            accessibilityLabel="Campo de pesquisa"
            style={[typography.body, styles.searchInput, { color: theme.text }]}
          />
          {query.length > 0 ? (
            <PressableScale onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </PressableScale>
          ) : null}
        </View>
        <PressableScale onPress={() => navigation.goBack()}>
          <Text style={[typography.body, { color: theme.primary, fontWeight: "600" }]}>
            Fechar
          </Text>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.results}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim().length >= 2 && results.length === 0 ? (
          <Text
            style={[typography.body, styles.emptyText, { color: theme.textMuted }]}
          >
            Nada encontrado para “{query.trim()}”.
          </Text>
        ) : null}
        {results.map((result) => (
          <PressableScale
            key={result.key}
            onPress={result.onPress}
            style={styles.resultItem}
          >
            <GlassCard padding={spacing.lg}>
              <View style={styles.resultRow}>
                <View
                  style={[styles.resultIcon, { backgroundColor: `${result.color}1F` }]}
                >
                  <Ionicons name={result.icon} size={18} color={result.color} />
                </View>
                <View style={styles.resultBody}>
                  <Text
                    style={[typography.body, { color: theme.text, fontWeight: "600" }]}
                    numberOfLines={1}
                  >
                    {result.title}
                  </Text>
                  <Text
                    style={[typography.caption, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {result.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </View>
            </GlassCard>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md },
  results: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xxl },
  emptyText: { textAlign: "center", marginTop: spacing.xxl },
  resultItem: { marginBottom: spacing.md },
  resultRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBody: { flex: 1, gap: 2 },
});
