import React, { useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";

import { FormSheet } from "../components/form/FormSheet";
import { ReminderPicker } from "../components/form/ReminderPicker";
import { Chip } from "../components/ui/Chip";
import { Field } from "../components/ui/Field";
import { PressableScale } from "../components/ui/PressableScale";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { brand } from "../theme/palette";
import { useTheme } from "../theme/ThemeProvider";
import { ThemePreference } from "../types";
import { confirmAction, showMessage } from "../utils/confirm";
import { formatFullDate } from "../utils/dates";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    state,
    updateSettings,
    connectMoodle,
    disconnectMoodle,
    syncMoodle,
    connectSuap,
    disconnectSuap,
    syncSuap,
  } = useApp();

  const [userName, setUserName] = useState(state.settings.userName);
  const [semesterLabel, setSemesterLabel] = useState(
    state.settings.semesterLabel,
  );
  const [themePref, setThemePref] = useState(state.settings.theme);
  const [haptics, setHaptics] = useState(state.settings.hapticsEnabled);
  const [defaultReminders, setDefaultReminders] = useState(
    state.settings.defaultReminders,
  );

  const moodle = state.integrations.moodle;
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [avaError, setAvaError] = useState<string | null>(null);

  const suap = state.integrations.suap;
  const [suapMatricula, setSuapMatricula] = useState("");
  const [suapSenha, setSuapSenha] = useState("");
  const [suapConnecting, setSuapConnecting] = useState(false);
  const [suapSyncing, setSuapSyncing] = useState(false);
  const [suapError, setSuapError] = useState<string | null>(null);

  const handleConnect = async () => {
    setAvaError(null);
    setConnecting(true);
    try {
      await connectMoodle();
    } catch (err) {
      setAvaError(err instanceof Error ? err.message : "Falha ao conectar.");
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setAvaError(null);
    setSyncing(true);
    try {
      const result = await syncMoodle();
      showMessage(
        "Sincronizado",
        `${result.disciplines} disciplina(s) e ${result.activities} atividade(s) atualizadas.`,
      );
    } catch (err) {
      setAvaError(err instanceof Error ? err.message : "Falha ao sincronizar.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    confirmAction(
      "Desconectar AVA",
      "Suas disciplinas e atividades já sincronizadas continuam salvas, mas não serão mais atualizadas.",
      "Desconectar",
      disconnectMoodle,
    );
  };

  const handleSuapConnect = async () => {
    setSuapError(null);
    setSuapConnecting(true);
    try {
      await connectSuap(suapMatricula.trim(), suapSenha);
      setSuapSenha("");
    } catch (err) {
      setSuapError(err instanceof Error ? err.message : "Falha ao conectar.");
    } finally {
      setSuapConnecting(false);
    }
  };

  const handleSuapSync = async () => {
    setSuapError(null);
    setSuapSyncing(true);
    try {
      const result = await syncSuap();
      showMessage(
        "Sincronizado",
        `${result.disciplines} disciplina(s), ${result.assessments} nota(s) e ${result.absences} frequência(s) atualizadas.`,
      );
    } catch (err) {
      setSuapError(err instanceof Error ? err.message : "Falha ao sincronizar.");
    } finally {
      setSuapSyncing(false);
    }
  };

  const handleSuapDisconnect = () => {
    confirmAction(
      "Desconectar SUAP",
      "Suas notas e frequências já sincronizadas continuam salvas, mas não serão mais atualizadas.",
      "Desconectar",
      disconnectSuap,
    );
  };

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

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        INTEGRAÇÕES
      </Text>

      <Text style={[typography.caption, styles.integrationSubLabel, { color: theme.textMuted, fontWeight: "700" }]}>
        AVA
      </Text>

      {Platform.OS === "web" ? (
        <View
          style={[
            styles.integrationNotice,
            { backgroundColor: theme.surfaceStrong, borderColor: theme.surfaceBorder },
          ]}
        >
          <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
            Disponível só no app do celular
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            O login do AVA exige o SUAP, que não funciona pela versão web.
            Abra o HubAcad instalado no celular para conectar.
          </Text>
        </View>
      ) : moodle ? (
        <View style={styles.integrationConnected}>
          <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
            Conectado como {moodle.displayName}
          </Text>
          <Text style={[typography.caption, styles.integrationSyncLabel, { color: theme.textSecondary }]}>
            {moodle.lastSyncISO
              ? `Última sincronização: ${formatFullDate(moodle.lastSyncISO)}`
              : "Ainda não sincronizado"}
          </Text>

          {avaError ? (
            <Text style={[typography.caption, styles.integrationError, { color: theme.danger }]}>
              {avaError}
            </Text>
          ) : null}

          <View style={styles.integrationButtonsRow}>
            <PressableScale onPress={handleSync} disabled={syncing} style={styles.integrationButtonFlex}>
              <View
                style={[
                  styles.integrationButton,
                  { backgroundColor: syncing ? theme.primarySoft : brand.lime },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: syncing ? theme.textMuted : brand.navy, fontWeight: "700" },
                  ]}
                >
                  {syncing ? "Sincronizando..." : "Sincronizar agora"}
                </Text>
              </View>
            </PressableScale>
            <PressableScale onPress={handleDisconnect} style={styles.integrationButtonFlex}>
              <View
                style={[
                  styles.integrationButton,
                  { backgroundColor: theme.surfaceStrong, borderWidth: 1, borderColor: theme.surfaceBorder },
                ]}
              >
                <Text style={[typography.caption, { color: theme.danger, fontWeight: "700" }]}>
                  Desconectar
                </Text>
              </View>
            </PressableScale>
          </View>
        </View>
      ) : (
        <View>
          <Text style={[typography.caption, styles.remindersHint, { color: theme.textSecondary }]}>
            Vai abrir o site do AVA num navegador para você logar com o SUAP.
          </Text>

          {avaError ? (
            <Text style={[typography.caption, styles.integrationError, { color: theme.danger }]}>
              {avaError}
            </Text>
          ) : null}

          <PressableScale onPress={handleConnect} disabled={connecting}>
            <View
              style={[
                styles.integrationButton,
                { backgroundColor: connecting ? theme.primarySoft : brand.lime },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: connecting ? theme.textMuted : brand.navy, fontWeight: "700" },
                ]}
              >
                {connecting ? "Conectando..." : "Entrar com SUAP"}
              </Text>
            </View>
          </PressableScale>
        </View>
      )}

      <Text style={[typography.caption, styles.integrationSubLabel, { color: theme.textMuted, fontWeight: "700" }]}>
        SUAP
      </Text>

      {Platform.OS === "web" ? (
        <View
          style={[
            styles.integrationNotice,
            { backgroundColor: theme.surfaceStrong, borderColor: theme.surfaceBorder },
          ]}
        >
          <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
            Disponível só no app do celular
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary }]}>
            A integração com o SUAP não funciona pela versão web. Abra o
            HubAcad instalado no celular para conectar.
          </Text>
        </View>
      ) : suap ? (
        <View style={styles.integrationConnected}>
          <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
            Conectado como {suap.displayName}
          </Text>
          <Text style={[typography.caption, styles.integrationSyncLabel, { color: theme.textSecondary }]}>
            {suap.lastSyncISO
              ? `Última sincronização: ${formatFullDate(suap.lastSyncISO)}`
              : "Ainda não sincronizado"}
          </Text>

          {suapError ? (
            <Text style={[typography.caption, styles.integrationError, { color: theme.danger }]}>
              {suapError}
            </Text>
          ) : null}

          <View style={styles.integrationButtonsRow}>
            <PressableScale onPress={handleSuapSync} disabled={suapSyncing} style={styles.integrationButtonFlex}>
              <View
                style={[
                  styles.integrationButton,
                  { backgroundColor: suapSyncing ? theme.primarySoft : brand.lime },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: suapSyncing ? theme.textMuted : brand.navy, fontWeight: "700" },
                  ]}
                >
                  {suapSyncing ? "Sincronizando..." : "Sincronizar agora"}
                </Text>
              </View>
            </PressableScale>
            <PressableScale onPress={handleSuapDisconnect} style={styles.integrationButtonFlex}>
              <View
                style={[
                  styles.integrationButton,
                  { backgroundColor: theme.surfaceStrong, borderWidth: 1, borderColor: theme.surfaceBorder },
                ]}
              >
                <Text style={[typography.caption, { color: theme.danger, fontWeight: "700" }]}>
                  Desconectar
                </Text>
              </View>
            </PressableScale>
          </View>
        </View>
      ) : (
        <View>
          <Text style={[typography.caption, styles.remindersHint, { color: theme.textSecondary }]}>
            Entre com sua matrícula e senha do SUAP para sincronizar boletim,
            frequência e horário.
          </Text>

          <View style={styles.integrationFieldGap}>
            <Field
              label="Matrícula"
              value={suapMatricula}
              onChangeText={setSuapMatricula}
              placeholder="202XXXXXXXXX"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.integrationFieldGap}>
            <Field
              label="Senha"
              value={suapSenha}
              onChangeText={setSuapSenha}
              placeholder="Senha do SUAP"
              secureTextEntry
            />
          </View>

          {suapError ? (
            <Text style={[typography.caption, styles.integrationError, { color: theme.danger }]}>
              {suapError}
            </Text>
          ) : null}

          <PressableScale
            onPress={handleSuapConnect}
            disabled={suapConnecting || !suapMatricula.trim() || !suapSenha}
          >
            <View
              style={[
                styles.integrationButton,
                {
                  backgroundColor:
                    suapConnecting || !suapMatricula.trim() || !suapSenha
                      ? theme.primarySoft
                      : brand.lime,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color:
                      suapConnecting || !suapMatricula.trim() || !suapSenha
                        ? theme.textMuted
                        : brand.navy,
                    fontWeight: "700",
                  },
                ]}
              >
                {suapConnecting ? "Conectando..." : "Entrar com SUAP"}
              </Text>
            </View>
          </PressableScale>
        </View>
      )}
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
  integrationSubLabel: { marginBottom: spacing.sm, marginTop: spacing.md },
  integrationNotice: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  integrationConnected: { gap: spacing.xs },
  integrationSyncLabel: { marginBottom: spacing.sm },
  integrationError: { marginBottom: spacing.md },
  integrationButtonsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  integrationButtonFlex: { flex: 1 },
  integrationButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  integrationFieldGap: { marginBottom: spacing.sm },
});
