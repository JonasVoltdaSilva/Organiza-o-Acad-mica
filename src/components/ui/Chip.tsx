import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { PressableScale } from "./PressableScale";

interface ChipProps {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export function Chip({ label, color, selected, onPress, icon }: ChipProps) {
  const theme = useTheme();
  const base = color ?? theme.primary;

  const body = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? base : theme.primarySoft,
          borderColor: selected ? base : "transparent",
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          { color: selected ? "#FFFFFF" : theme.textSecondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return body;
  return <PressableScale onPress={onPress}>{body}</PressableScale>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: { ...typography.caption, fontWeight: "600" },
});
