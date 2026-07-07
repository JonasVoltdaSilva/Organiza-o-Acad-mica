import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { GlassCard } from "../ui/GlassCard";

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({ icon, label, value, color, style }: StatTileProps) {
  const theme = useTheme();
  const accent = color ?? theme.primary;
  return (
    <GlassCard padding={spacing.lg} style={[styles.tile, style]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={[typography.title, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text
        style={[typography.micro, styles.label, { color: theme.textMuted }]}
        numberOfLines={2}
      >
        {label.toUpperCase()}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: spacing.sm, minHeight: 120 },
  label: { fontSize: 10, lineHeight: 14 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});
