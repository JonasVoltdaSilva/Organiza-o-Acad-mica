import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { radius, spacing } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  intensity?: number;
}

/**
 * Cartão translúcido com blur — o bloco de construção visual do HubAcad.
 * Um gradiente sutil (mais claro no topo) simula luz incidente e dá
 * profundidade de "vidro lapidado" ao cartão.
 * No Android o blur é mais custoso, então usamos uma superfície
 * semitransparente sólida como fallback equivalente.
 */
export function GlassCard({
  children,
  style,
  padding = spacing.xl,
  intensity,
}: GlassCardProps) {
  const theme = useTheme();

  const sheen: [string, string] =
    theme.mode === "dark"
      ? ["rgba(160, 228, 210, 0.10)", "rgba(160, 228, 210, 0.015)"]
      : ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.40)"];

  const shell: ViewStyle = {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
    // Aresta superior mais clara: o "fio de luz" que reforça o relevo.
    borderTopColor:
      theme.mode === "dark"
        ? "rgba(190, 240, 225, 0.28)"
        : "rgba(255, 255, 255, 0.95)",
    overflow: "hidden",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
    backgroundColor:
      Platform.OS === "android" ? theme.surfaceStrong : "transparent",
  };

  if (Platform.OS === "android") {
    return (
      <View style={[shell, style]}>
        <LinearGradient colors={sheen} style={{ padding }}>
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[shell, style]}>
      <BlurView
        intensity={intensity ?? theme.blurIntensity}
        tint={theme.blurTint}
        style={styles.blur}
      >
        <LinearGradient
          colors={sheen}
          style={[styles.blur, { backgroundColor: theme.surface, padding }]}
        >
          {children}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blur: { width: "100%" },
});
