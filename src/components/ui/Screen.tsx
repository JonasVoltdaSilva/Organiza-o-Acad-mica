import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/layout";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** espaço extra no rodapé (ex.: acima da tab bar) */
  bottomInset?: number;
}

export function Screen({
  children,
  scroll = true,
  style,
  bottomInset = 110,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: bottomInset },
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        styles.fill,
        { paddingTop: insets.top + spacing.md, paddingBottom: bottomInset },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <LinearGradient colors={theme.backgroundGradient} style={styles.fill}>
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: spacing.screen },
});
