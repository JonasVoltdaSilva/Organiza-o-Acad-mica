import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { DEFAULT_CLASS_HOURS } from "../../constants";
import { useApp } from "../../providers/AppProvider";
import { radius, spacing, typography } from "../../theme/layout";
import { useTheme } from "../../theme/ThemeProvider";
import { AbsenceEntry, Discipline } from "../../types";
import { AttendanceSummary } from "../../utils/attendance";
import { formatShortDate } from "../../utils/dates";
import { createId } from "../../utils/id";
import { GlassCard } from "../ui/GlassCard";
import { PressableScale } from "../ui/PressableScale";
import { ProgressBar } from "../ui/ProgressBar";

interface AttendanceSectionProps {
  discipline: Discipline;
  absences: AbsenceEntry[];
  attendance: AttendanceSummary;
}

/** Frequência com a regra da UFR: mínimo de 75% de presença. */
export function AttendanceSection({
  discipline,
  absences,
  attendance,
}: AttendanceSectionProps) {
  const theme = useTheme();
  const { addAbsence, deleteAbsence } = useApp();

  const statusColor =
    attendance.status === "excedido"
      ? theme.danger
      : attendance.status === "alerta"
        ? theme.warning
        : theme.success;

  const registerAbsence = () => {
    addAbsence({
      id: createId(),
      disciplineId: discipline.id,
      dateISO: new Date().toISOString(),
      hours: DEFAULT_CLASS_HOURS,
    });
  };

  return (
    <GlassCard>
      <View style={styles.topRow}>
        <View style={styles.metric}>
          <Text style={[typography.title, { color: statusColor }]}>
            {Math.round(attendance.attendancePercent)}%
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            PRESENÇA
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[typography.title, { color: theme.text }]}>
            {attendance.usedAbsenceHours}h
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            FALTAS ({Math.round(attendance.absencePercent)}%)
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[typography.title, { color: theme.text }]}>
            {attendance.remainingAbsenceHours}h
          </Text>
          <Text style={[typography.micro, { color: theme.textMuted }]}>
            RESTANTES
          </Text>
        </View>
      </View>

      <ProgressBar progress={attendance.usedRatio} color={statusColor} />
      <Text style={[typography.micro, styles.limit, { color: theme.textMuted }]}>
        LIMITE: {attendance.maxAbsenceHours}H DE FALTA ({discipline.workloadHours}
        H DE CARGA HORÁRIA — REGRA UFR 75%)
      </Text>

      {attendance.status === "alerta" ? (
        <View style={[styles.alert, { backgroundColor: `${theme.warning}22` }]}>
          <Ionicons name="warning" size={16} color={theme.warning} />
          <Text style={[typography.caption, styles.alertText, { color: theme.warning }]}>
            Atenção: você está perto do limite de faltas.
          </Text>
        </View>
      ) : null}
      {attendance.status === "excedido" ? (
        <View style={[styles.alert, { backgroundColor: `${theme.danger}22` }]}>
          <Ionicons name="alert-circle" size={16} color={theme.danger} />
          <Text style={[typography.caption, styles.alertText, { color: theme.danger }]}>
            Limite de faltas ultrapassado — risco de reprovação por frequência.
          </Text>
        </View>
      ) : null}

      {absences.length > 0 ? (
        <View style={styles.list}>
          {absences
            .slice()
            .reverse()
            .slice(0, 5)
            .map((absence) => (
              <View key={absence.id} style={styles.absenceRow}>
                <Ionicons
                  name="remove-circle-outline"
                  size={16}
                  color={theme.textMuted}
                />
                <Text
                  style={[typography.caption, styles.absenceText, { color: theme.textSecondary }]}
                >
                  {formatShortDate(absence.dateISO)} · {absence.hours}h
                </Text>
                <PressableScale onPress={() => deleteAbsence(absence.id)}>
                  <Ionicons name="close" size={16} color={theme.textMuted} />
                </PressableScale>
              </View>
            ))}
        </View>
      ) : null}

      <PressableScale onPress={registerAbsence}>
        <View style={[styles.registerButton, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
          <Text style={[typography.caption, { color: theme.primary, fontWeight: "700" }]}>
            Registrar falta de hoje ({DEFAULT_CLASS_HOURS}h)
          </Text>
        </View>
      </PressableScale>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  metric: { alignItems: "center", gap: 2 },
  limit: { marginTop: spacing.sm },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  alertText: { flex: 1, fontWeight: "600" },
  list: { marginTop: spacing.md, gap: spacing.xs },
  absenceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  absenceText: { flex: 1 },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
    minHeight: 44,
  },
});
