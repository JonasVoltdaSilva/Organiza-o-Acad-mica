import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { PressableScale } from "./PressableScale";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Espaçamento reduzido no topo — usado quando o header não é o primeiro elemento de uma seção. */
  compact?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, compact }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Text style={[typography.heading, { color: theme.text }]}>{title}</Text>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction}>
          <Text style={[typography.caption, styles.action, { color: theme.primary }]}>
            {actionLabel}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  rowCompact: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  action: { fontWeight: "700" },
});
