import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";

import { brand } from "../../theme/palette";
import { PressableScale } from "./PressableScale";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  bottom?: number;
}

export function FAB({ onPress, icon = "add", bottom = 126 }: FABProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic={Haptics.ImpactFeedbackStyle.Medium}
      style={[styles.fab, { bottom }]}
    >
      {/* Gradiente diagonal claro→escuro: dá volume de esfera ao botão. */}
      <LinearGradient
        colors={[brand.green, brand.greenDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
});
