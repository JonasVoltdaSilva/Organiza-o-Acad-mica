import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";

export interface SegmentedTabItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SegmentedTabsProps {
  tabs: SegmentedTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

/** Segmented control local a uma tela — não é navegação, é troca de seção exibida. */
export function SegmentedTabs({ tabs, activeKey, onChange, style }: SegmentedTabsProps) {
  const theme = useTheme();
  const itemRefs = useRef<(View | null)[]>([]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const nodes = itemRefs.current.map((ref) => ref as unknown as HTMLElement | null);
    const handleKeyDown = (index: number) => (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      onChange(tabs[nextIndex].key);
      nodes[nextIndex]?.focus();
    };

    const listeners = nodes.map((node, index) => {
      if (!node) return null;
      const listener = handleKeyDown(index);
      node.addEventListener("keydown", listener);
      return { node, listener };
    });

    return () => {
      listeners.forEach((entry) => {
        entry?.node.removeEventListener("keydown", entry.listener);
      });
    };
  }, [tabs, onChange]);

  // Carrossel horizontal: cada aba ocupa sua largura natural (nunca trunca);
  // com folga sobrando, flexGrow distribui o espaço extra entre as abas.
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        accessibilityRole="tablist"
        style={[
          styles.shell,
          { backgroundColor: theme.surfaceStrong, borderColor: theme.surfaceBorder },
        ]}
      >
      {tabs.map((tab, index) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            ref={(node) => {
              itemRefs.current[index] = node as unknown as View | null;
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[
              styles.tab,
              {
                backgroundColor: active ? theme.primary : theme.primarySoft,
              },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              if (!active) onChange(tab.key);
            }}
          >
            {tab.icon ? (
              <Ionicons
                name={tab.icon}
                size={15}
                color={active ? "#FFFFFF" : theme.textSecondary}
              />
            ) : null}
            <Text
              style={[
                typography.caption,
                styles.label,
                { color: active ? "#FFFFFF" : theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  shell: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  label: { fontWeight: "700" },
});
