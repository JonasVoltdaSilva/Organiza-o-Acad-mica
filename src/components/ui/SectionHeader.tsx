import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { PressableScale } from "./PressableScale";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
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
  action: { fontWeight: "700" },
});
