import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useApp } from "../../providers/AppProvider";

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  haptic?: Haptics.ImpactFeedbackStyle | null;
  disabled?: boolean;
}

/** Pressable com microinteração de escala (spring) e feedback tátil. */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  haptic = Haptics.ImpactFeedbackStyle.Light,
  disabled,
}: PressableScaleProps) {
  const { state } = useApp();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      onPress={() => {
        if (haptic && state.settings.hapticsEnabled) {
          Haptics.impactAsync(haptic);
        }
        onPress?.();
      }}
      onLongPress={onLongPress}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
