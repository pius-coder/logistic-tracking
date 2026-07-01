import { roundMoney } from "./pricing";

type FreightVariables = {
  basePriceUsd: number;
  quantity: number;
  weightKg: number;
  volumeM3: number;
  packageCount: number;
};

const SAFE_EXPRESSION = /^[\d\s()+\-*/._a-zA-Z]+$/;

export const DEFAULT_FREIGHT_RULES: Record<"AVION" | "BATEAU", {
  title: string;
  formulaExpression: string;
  formulaVariables: string;
  minimumChargeUsd: number;
}> = {
  AVION: {
    title: "Fret avion standard",
    formulaExpression: "(quantity * 8) + (weightKg * 14) + 35",
    formulaVariables: "quantity: quantite commandee, weightKg: poids en kg",
    minimumChargeUsd: 55,
  },
  BATEAU: {
    title: "Fret bateau standard",
    formulaExpression: "(quantity * 3.5) + (volumeM3 * 220) + 18",
    formulaVariables: "quantity: quantite commandee, volumeM3: volume en m3",
    minimumChargeUsd: 30,
  },
};

export function getDefaultFreightRule(transportMode: "AVION" | "BATEAU") {
  return DEFAULT_FREIGHT_RULES[transportMode];
}

export function evaluateFreightFormula(
  expression: string,
  variables: FreightVariables,
  minimumChargeUsd = 0,
) {
  if (!SAFE_EXPRESSION.test(expression)) {
    throw new Error("La formule de fret contient des caracteres non autorises.");
  }

  let evaluatedExpression = expression;

  for (const [key, value] of Object.entries(variables)) {
    const numericValue = Number.isFinite(value) ? String(value) : "0";
    evaluatedExpression = evaluatedExpression.replace(
      new RegExp(`\\b${key}\\b`, "g"),
      numericValue,
    );
  }

  if (/[a-zA-Z]/.test(evaluatedExpression)) {
    throw new Error("La formule de fret reference des variables inconnues.");
  }

  const result = Function(
    `"use strict"; return (${evaluatedExpression});`,
  )() as number;

  if (!Number.isFinite(result)) {
    throw new Error("Le calcul du fret a retourne une valeur invalide.");
  }

  return Math.max(roundMoney(result), minimumChargeUsd);
}
