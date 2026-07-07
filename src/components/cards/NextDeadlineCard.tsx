import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      {/* Gradiente verde diagonal: profundidade sem sair da cor da marca. */}
      <LinearGradient
        colors={["#0B9D62", "#00663D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons
              name={kind === "prova" ? "document-text" : "flag"}
              size={13}
              color={brand.cream}
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
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
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
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.micro, color: brand.cream },
  countdown: {
    ...typography.caption,
    fontWeight: "800",
    color: brand.navy,
    backgroundColor: brand.lime,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  title: { ...typography.title, color: "#FFFFFF" },
  date: {
    ...typography.caption,
    color: "rgba(246,247,237,0.78)",
    textTransform: "capitalize",
  },
});
