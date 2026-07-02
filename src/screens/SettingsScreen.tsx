import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { FormSheet } from "../components/form/FormSheet";
import { ReminderPicker } from "../components/form/ReminderPicker";
import { Chip } from "../components/ui/Chip";
import { Field } from "../components/ui/Field";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../providers/AppProvider";
import { spacing, typography } from "../theme/layout";
import { useTheme } from "../theme/ThemeProvider";
import { ThemePreference } from "../types";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state, updateSettings } = useApp();

  const [userName, setUserName] = useState(state.settings.userName);
  const [semesterLabel, setSemesterLabel] = useState(
    state.settings.semesterLabel,
  );
  const [themePref, setThemePref] = useState(state.settings.theme);
  const [haptics, setHaptics] = useState(state.settings.hapticsEnabled);
  const [defaultReminders, setDefaultReminders] = useState(
    state.settings.defaultReminders,
  );

  const save = () => {
    updateSettings({
      userName: userName.trim(),
      semesterLabel: semesterLabel.trim(),
      theme: themePref,
      hapticsEnabled: haptics,
      defaultReminders,
    });
    navigation.goBack();
  };

  return (
    <FormSheet title="Ajustes" onSave={save}>
      <Field
        label="Seu nome"
        value={userName}
        onChangeText={setUserName}
        placeholder="Como quer ser chamado?"
      />
      <Field
        label="Semestre atual"
        value={semesterLabel}
        onChangeText={setSemesterLabel}
        placeholder="2026/1"
      />

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        TEMA
      </Text>
      <View style={styles.chipsRow}>
        {THEME_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={themePref === option.value}
            onPress={() => setThemePref(option.value)}
          />
        ))}
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
            Feedback tátil
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            Vibração suave ao tocar em botões
          </Text>
        </View>
        <Switch
          value={haptics}
          onValueChange={setHaptics}
          trackColor={{ true: theme.primary }}
          accessibilityLabel="Ativar feedback tátil"
        />
      </View>

      <Text style={[typography.caption, styles.remindersHint, { color: theme.textSecondary }]}>
        Lembretes padrão para novas atividades e provas:
      </Text>
      <ReminderPicker selected={defaultReminders} onChange={setDefaultReminders} />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  switchText: { flex: 1, gap: 2 },
  remindersHint: { marginBottom: spacing.sm },
});
