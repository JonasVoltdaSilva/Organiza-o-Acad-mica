import { BlurView } from "expo-blur";
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

  const shell: ViewStyle = {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
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
      <View style={[shell, { padding }, style]}>{children}</View>
    );
  }

  return (
    <View style={[shell, style]}>
      <BlurView
        intensity={intensity ?? theme.blurIntensity}
        tint={theme.blurTint}
        style={[styles.blur, { backgroundColor: theme.surface, padding }]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blur: { width: "100%" },
});
