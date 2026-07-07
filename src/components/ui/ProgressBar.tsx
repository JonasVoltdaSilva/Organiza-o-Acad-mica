import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { lighten } from "../../utils/color";

interface ProgressBarProps {
  /** 0–1 */
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
  const theme = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(Math.min(1, Math.max(0, progress)), {
      damping: 20,
      stiffness: 120,
    });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[
        styles.track,
        { height, borderRadius: radius.pill, backgroundColor: theme.primarySoft },
      ]}
    >
      <Animated.View style={[fillStyle, { height, borderRadius: radius.pill }]}>
        {/* Preenchimento com leve gradiente vertical para dar relevo à barra. */}
        <LinearGradient
          colors={[lighten(color ?? theme.primary, 0.25), color ?? theme.primary]}
          style={[styles.fill, { borderRadius: radius.pill }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
});
