import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { radius, spacing } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";

interface SwipeableRowProps {
  children: React.ReactNode;
  /** swipe da esquerda para a direita (ex.: concluir) */
  onSwipeRight?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightColor?: string;
  /** swipe da direita para a esquerda (ex.: excluir) */
  onSwipeLeft?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftColor?: string;
}

/** Linha com gestos de swipe para concluir/excluir itens. */
export function SwipeableRow({
  children,
  onSwipeRight,
  rightIcon = "checkmark-circle",
  rightColor,
  onSwipeLeft,
  leftIcon = "trash",
  leftColor,
}: SwipeableRowProps) {
  const theme = useTheme();
  const swipeRef = React.useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={swipeRef}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={
        onSwipeRight
          ? () => (
              <View
                style={[
                  styles.action,
                  styles.left,
                  { backgroundColor: rightColor ?? theme.success },
                ]}
              >
                <Ionicons name={rightIcon} size={24} color="#FFFFFF" />
              </View>
            )
          : undefined
      }
      renderRightActions={
        onSwipeLeft
          ? () => (
              <View
                style={[
                  styles.action,
                  styles.right,
                  { backgroundColor: leftColor ?? theme.danger },
                ]}
              >
                <Ionicons name={leftIcon} size={24} color="#FFFFFF" />
              </View>
            )
          : undefined
      }
      onSwipeableOpen={(direction) => {
        swipeRef.current?.close();
        if (direction === "left") onSwipeRight?.();
        else onSwipeLeft?.();
      }}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    width: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  left: { marginRight: -spacing.md },
  right: { marginLeft: -spacing.md },
});
