import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Início: "home",
  Disciplinas: "school",
  Calendário: "calendar",
  Estatísticas: "stats-chart",
};

/** Tab bar flutuante em vidro — pilar da identidade visual do HubAcad. */
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={styles.row}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = TAB_ICONS[route.name] ?? "ellipse";
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={route.name}
            style={styles.tab}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              if (!focused) navigation.navigate(route.name as never);
            }}
          >
            <View
              style={[
                styles.iconWrap,
                focused && { backgroundColor: theme.accent },
              ]}
            >
              <Ionicons
                name={focused ? icon : (`${icon}-outline` as never)}
                size={21}
                color={focused ? theme.accentText : theme.textMuted}
              />
            </View>
            <Text
              style={[
                typography.micro,
                { color: focused ? theme.text : theme.textMuted },
              ]}
              numberOfLines={1}
            >
              {route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const shellStyle = [
    styles.shell,
    {
      bottom: Math.max(insets.bottom, spacing.md),
      borderColor: theme.surfaceBorder,
      shadowColor: theme.shadow,
      backgroundColor:
        Platform.OS === "android" ? theme.surfaceStrong : "transparent",
    },
  ];

  if (Platform.OS === "android") {
    return <View style={shellStyle}>{content}</View>;
  }

  return (
    <View style={shellStyle}>
      <BlurView
        intensity={theme.blurIntensity + 20}
        tint={theme.blurTint}
        style={[styles.blur, { backgroundColor: theme.surface }]}
      >
        {content}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    left: spacing.screen,
    right: spacing.screen,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 10,
  },
  blur: { width: "100%" },
  row: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
