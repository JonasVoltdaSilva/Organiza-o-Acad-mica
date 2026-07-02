import { Assessment, EvaluationConfig } from "../types";

export type GradeSituation =
  | "aprovado"
  | "em_andamento"
  | "em_recuperacao"
  | "reprovado";

export interface GradeSummary {
  launched: Assessment[];
  pending: Assessment[];
  /** média considerando apenas as avaliações lançadas */
  partialAverage: number | null;
  /** média final projetada se as pendentes valerem 0 */
  guaranteedAverage: number | null;
  /** nota média necessária nas avaliações pendentes para aprovação */
  neededOnRemaining: number | null;
  situation: GradeSituation;
  situationLabel: string;
}

function weightOf(a: Assessment, mode: EvaluationConfig["mode"]): number {
  return mode === "simples" ? 1 : a.weight;
}

export function summarizeGrades(
  assessments: Assessment[],
  config: EvaluationConfig,
): GradeSummary {
  const launched = assessments.filter((a) => a.grade !== null);
  const pending = assessments.filter((a) => a.grade === null);

  const launchedWeight = launched.reduce(
    (s, a) => s + weightOf(a, config.mode),
    0,
  );
  const pendingWeight = pending.reduce(
    (s, a) => s + weightOf(a, config.mode),
    0,
  );
  const totalWeight = launchedWeight + pendingWeight;

  const launchedPoints = launched.reduce(
    (s, a) => s + (a.grade ?? 0) * weightOf(a, config.mode),
    0,
  );

  const partialAverage =
    launchedWeight > 0 ? launchedPoints / launchedWeight : null;
  const guaranteedAverage =
    totalWeight > 0 ? launchedPoints / totalWeight : null;

  let neededOnRemaining: number | null = null;
  if (pendingWeight > 0 && totalWeight > 0) {
    const targetPoints = config.passingGrade * totalWeight;
    neededOnRemaining = Math.max(
      0,
      (targetPoints - launchedPoints) / pendingWeight,
    );
  }

  let situation: GradeSituation;
  if (assessments.length === 0 || launched.length === 0) {
    situation = "em_andamento";
  } else if (pending.length > 0) {
    if (
      neededOnRemaining !== null &&
      neededOnRemaining > config.maxGrade
    ) {
      situation = "em_recuperacao";
    } else if ((guaranteedAverage ?? 0) >= config.passingGrade) {
      situation = "aprovado";
    } else {
      situation = "em_andamento";
    }
  } else {
    const final = partialAverage ?? 0;
    if (final >= config.passingGrade) situation = "aprovado";
    else if (final >= config.passingGrade / 2) situation = "em_recuperacao";
    else situation = "reprovado";
  }

  const labels: Record<GradeSituation, string> = {
    aprovado: "Aprovado",
    em_andamento: "Em andamento",
    em_recuperacao: "Em recuperação",
    reprovado: "Reprovado",
  };

  return {
    launched,
    pending,
    partialAverage,
    guaranteedAverage,
    neededOnRemaining,
    situation,
    situationLabel: labels[situation],
  };
}

export function formatGrade(value: number | null): string {
  if (value === null) return "–";
  return value.toFixed(1).replace(".", ",");
}
