import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { brand } from "../../theme/palette";
import { countdownLabel, formatFullDate } from "../../utils/dates";
import { PressableScale } from "../ui/PressableScale";

interface NextDeadlineCardProps {
  kind: "atividade" | "prova";
  title: string;
  dateISO: string;
  onPress?: () => void;
}

/**
 * Cartão-herói do próximo prazo — o elemento mais importante da tela,
 * sempre em destaque com a cor de acento da marca.
 */
export function NextDeadlineCard({
  kind,
  title,
  dateISO,
  onPress,
}: NextDeadlineCardProps) {
  return (
    <PressableScale onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons
              name={kind === "prova" ? "document-text" : "flag"}
              size={13}
              color={brand.navy}
            />
            <Text style={styles.badgeText}>
              {kind === "prova" ? "PRÓXIMA PROVA" : "PRÓXIMA ENTREGA"}
            </Text>
          </View>
          <Text style={styles.countdown}>{countdownLabel(dateISO)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.date}>{formatFullDate(dateISO)}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.lime,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.55)",
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.micro, color: brand.navy },
  countdown: { ...typography.caption, fontWeight: "800", color: brand.navy },
  title: { ...typography.title, color: brand.navy },
  date: {
    ...typography.caption,
    color: "rgba(0,31,63,0.65)",
    textTransform: "capitalize",
  },
});
