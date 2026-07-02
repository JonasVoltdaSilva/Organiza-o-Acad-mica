import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { GlassCard } from "./GlassCard";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <GlassCard style={styles.card}>
      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name={icon} size={26} color={theme.primary} />
        </View>
        <Text style={[typography.body, styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[typography.caption, styles.subtitle, { color: theme.textMuted }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  center: { alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "700", textAlign: "center" },
  subtitle: { textAlign: "center" },
});
