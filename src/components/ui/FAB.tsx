import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet } from "react-native";

import { brand } from "../../theme/palette";
import { PressableScale } from "./PressableScale";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  bottom?: number;
}

export function FAB({ onPress, icon = "add", bottom = 108 }: FABProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic={Haptics.ImpactFeedbackStyle.Medium}
      style={[styles.fab, { bottom }]}
    >
      <Ionicons name={icon} size={28} color={brand.navy} />
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
    backgroundColor: brand.lime,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
});
