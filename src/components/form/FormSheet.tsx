import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography } from "../../theme/layout";
import { brand } from "../../theme/palette";
import { useTheme } from "../../theme/ThemeProvider";
import { PressableScale } from "../ui/PressableScale";

interface FormSheetProps {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saveEnabled?: boolean;
  saveLabel?: string;
}

/** Shell padrão das telas modais de criação/edição. */
export function FormSheet({
  title,
  children,
  onSave,
  saveEnabled = true,
  saveLabel = "Salvar",
}: FormSheetProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.fill, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale onPress={() => navigation.goBack()}>
          <Text style={[typography.body, { color: theme.textSecondary }]}>
            Cancelar
          </Text>
        </PressableScale>
        <Text style={[typography.heading, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <PressableScale onPress={onSave} disabled={!saveEnabled}>
          <View
            style={[
              styles.saveButton,
              {
                backgroundColor: saveEnabled ? brand.lime : theme.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: saveEnabled ? brand.navy : theme.textMuted,
                  fontWeight: "700",
                },
              ]}
            >
              {saveLabel}
            </Text>
          </View>
        </PressableScale>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  content: { paddingHorizontal: spacing.screen, paddingTop: spacing.md },
});
