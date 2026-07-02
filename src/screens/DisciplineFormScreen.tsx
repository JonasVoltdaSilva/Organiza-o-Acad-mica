import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Field } from "../components/ui/Field";
import { FormSheet } from "../components/form/FormSheet";
import { Chip } from "../components/ui/Chip";
import { PressableScale } from "../components/ui/PressableScale";
import {
  DEFAULT_MAX_GRADE,
  DEFAULT_PASSING_GRADE,
  WEEKDAY_SHORT,
} from "../constants";
import { RootStackParamList } from "../navigation/types";
import { useApp } from "../providers/AppProvider";
import { radius, spacing, typography } from "../theme/layout";
import { disciplineColors, disciplineIcons } from "../theme/palette";
import { useTheme } from "../theme/ThemeProvider";
import { showMessage } from "../utils/confirm";
import { createId } from "../utils/id";

type FormRoute = RouteProp<RootStackParamList, "DisciplineForm">;

export function DisciplineFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const { state, upsertDiscipline } = useApp();

  const existing = state.disciplines.find(
    (d) => d.id === route.params?.disciplineId,
  );

  const [name, setName] = useState(existing?.name ?? "");
  const [professor, setProfessor] = useState(existing?.professor ?? "");
  const [workload, setWorkload] = useState(
    existing ? String(existing.workloadHours) : "",
  );
  const [semester, setSemester] = useState(
    existing?.semester ?? state.settings.semesterLabel,
  );
  const [room, setRoom] = useState(existing?.room ?? "");
  const [observations, setObservations] = useState(existing?.observations ?? "");
  const [color, setColor] = useState(existing?.color ?? disciplineColors[0]);
  const [icon, setIcon] = useState(existing?.icon ?? disciplineIcons[0]);
  const [classDays, setClassDays] = useState<number[]>(existing?.classDays ?? []);
  const [mode, setMode] = useState(existing?.evaluation.mode ?? "simples");
  const [passingGrade, setPassingGrade] = useState(
    String(existing?.evaluation.passingGrade ?? DEFAULT_PASSING_GRADE),
  );

  const valid = name.trim().length > 0 && Number(workload) > 0;

  const save = () => {
    if (!name.trim()) {
      showMessage("Falta o nome", "Dê um nome para a disciplina.");
      return;
    }
    if (!(Number(workload) > 0)) {
      showMessage(
        "Falta a carga horária",
        "Informe a carga horária em horas (ex.: 32, 64, 96).",
      );
      return;
    }
    if (!valid) return;
    upsertDiscipline({
      id: existing?.id ?? createId(),
      name: name.trim(),
      professor: professor.trim(),
      workloadHours: Number(workload),
      semester: semester.trim(),
      room: room.trim() || undefined,
      observations: observations.trim() || undefined,
      color,
      icon,
      classDays,
      evaluation: {
        mode,
        passingGrade:
          Number(passingGrade.replace(",", ".")) || DEFAULT_PASSING_GRADE,
        maxGrade: existing?.evaluation.maxGrade ?? DEFAULT_MAX_GRADE,
      },
      goals: existing?.goals ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    navigation.goBack();
  };

  const toggleDay = (day: number) => {
    setClassDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );
  };

  return (
    <FormSheet
      title={existing ? "Editar disciplina" : "Nova disciplina"}
      onSave={save}
      saveEnabled={valid}
    >
      <Field
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Ex.: Cálculo I"
        autoFocus={!existing}
      />
      <Field
        label="Professor"
        value={professor}
        onChangeText={setProfessor}
        placeholder="Nome do professor"
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field
            label="Carga horária (h)"
            value={workload}
            onChangeText={setWorkload}
            placeholder="64"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.flex}>
          <Field
            label="Semestre"
            value={semester}
            onChangeText={setSemester}
            placeholder="2026/1"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field
            label="Sala (opcional)"
            value={room}
            onChangeText={setRoom}
            placeholder="B-204"
          />
        </View>
        <View style={styles.flex}>
          <Field
            label="Nota p/ aprovação"
            value={passingGrade}
            onChangeText={setPassingGrade}
            placeholder="6,0"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        DIAS DE AULA
      </Text>
      <View style={styles.daysRow}>
        {WEEKDAY_SHORT.map((label, day) => {
          const selected = classDays.includes(day);
          return (
            <PressableScale key={day} onPress={() => toggleDay(day)}>
              <View
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: selected ? color : theme.surfaceStrong,
                    borderColor: selected ? color : theme.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: selected ? "#FFFFFF" : theme.textSecondary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        COR
      </Text>
      <View style={styles.swatchRow}>
        {disciplineColors.map((swatch) => (
          <PressableScale key={swatch} onPress={() => setColor(swatch)}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                color === swatch && styles.swatchSelected,
              ]}
            >
              {color === swatch ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : null}
            </View>
          </PressableScale>
        ))}
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        ÍCONE
      </Text>
      <View style={styles.swatchRow}>
        {disciplineIcons.map((glyph) => (
          <PressableScale key={glyph} onPress={() => setIcon(glyph)}>
            <View
              style={[
                styles.iconOption,
                {
                  backgroundColor:
                    icon === glyph ? `${color}22` : theme.surfaceStrong,
                  borderColor: icon === glyph ? color : theme.surfaceBorder,
                },
              ]}
            >
              <Ionicons
                name={glyph}
                size={20}
                color={icon === glyph ? color : theme.textSecondary}
              />
            </View>
          </PressableScale>
        ))}
      </View>

      <Text style={[typography.micro, styles.label, { color: theme.textMuted }]}>
        SISTEMA DE AVALIAÇÃO
      </Text>
      <View style={styles.modeRow}>
        <Chip
          label="Média simples"
          selected={mode === "simples"}
          onPress={() => setMode("simples")}
        />
        <Chip
          label="Média ponderada (pesos)"
          selected={mode === "ponderada"}
          onPress={() => setMode("ponderada")}
        />
      </View>

      <Field
        label="Observações"
        value={observations}
        onChangeText={setObservations}
        placeholder="Anotações gerais sobre a disciplina"
        multiline
      />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  daysRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
