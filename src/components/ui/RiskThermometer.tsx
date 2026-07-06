import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { AcademicRisk, RiskLevel } from "../../utils/academicRisk";
import { GlassCard } from "./GlassCard";
import { PressableScale } from "./PressableScale";

interface RiskThermometerProps {
  risk: AcademicRisk;
  size?: "sm" | "md";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const RISK_META: Record<
  RiskLevel,
  { icon: keyof typeof Ionicons.glyphMap; label: string; colorKey: "success" | "warning" | "danger" }
> = {
  baixo: { icon: "checkmark-circle", label: "Tranquilo", colorKey: "success" },
  medio: { icon: "warning", label: "Atenção", colorKey: "warning" },
  alto: { icon: "alert-circle", label: "Em risco", colorKey: "danger" },
};

export function RiskThermometer({ risk, size = "md", onPress, style }: RiskThermometerProps) {
  const theme = useTheme();
  const meta = RISK_META[risk.level];
  const color = theme[meta.colorKey];

  const content =
    size === "sm" ? (
      <View style={[styles.pill, { backgroundColor: `${color}22` }, style]}>
        <Ionicons name={meta.icon} size={16} color={color} />
        <Text style={[typography.caption, styles.pillText, { color }]} numberOfLines={1}>
          {meta.label}
        </Text>
      </View>
    ) : (
      <GlassCard style={style}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}1F` }]}>
            <Ionicons name={meta.icon} size={22} color={color} />
          </View>
          <View style={styles.textCol}>
            <Text style={[typography.heading, { color }]}>{meta.label}</Text>
            <Text
              style={[typography.caption, { color: theme.textMuted }]}
              numberOfLines={2}
            >
              {risk.reason}
            </Text>
          </View>
        </View>
      </GlassCard>
    );

  if (!onPress) return content;

  return (
    <PressableScale onPress={onPress} style={[styles.pressable, size === "sm" && style]}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: 44, justifyContent: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minHeight: 44,
  },
  pillText: { fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 2 },
});
