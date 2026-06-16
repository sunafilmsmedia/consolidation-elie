import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { LEVEL_LABELS } from "./scoring";
import { formatCurrency } from "./format";
import type { RecommendationContent } from "./recommendation";

/**
 * Génération de la réponse IA personnalisée.
 *
 * --- STUB ---
 * Pour l'instant, on retourne un texte construit localement (déterministe),
 * dans le ton/structure attendus. Quand la clé OpenAI sera disponible,
 * remplacer le corps de `generateAnalysis` par un appel serveur à l'API,
 * en gardant la même signature et le même fallback en cas d'échec.
 */

export const SYSTEM_PROMPT = `Tu es un assistant spécialisé en vulgarisation hypothécaire pour un courtier hypothécaire au Canada.
Ton rôle est d'expliquer simplement à l'utilisateur son potentiel d'économie par consolidation de dettes ou refinancement hypothécaire.
Tu dois être clair, rassurant et prudent.
Tu ne dois jamais promettre une approbation.
Tu ne dois jamais garantir une économie.
Tu ne dois jamais dire que l'utilisateur est admissible avec certitude.
Tu dois toujours préciser que le résultat est une estimation basée sur les informations fournies.
Tu dois encourager l'utilisateur à valider sa situation avec un courtier hypothécaire.
Écris dans un français québécois professionnel, simple et humain.`;

export interface AIResult {
  text: string;
  generated: boolean;
}

export async function generateAnalysis(
  input: CalculatorInput,
  result: Omit<CalculatorResult, "aiResponse">,
  recommendation: RecommendationContent
): Promise<AIResult> {
  try {
    // TODO: brancher l'appel OpenAI côté serveur ici.
    // const completion = await openai.chat.completions.create({ ... })
    // return { text: completion..., generated: true };
    return { text: buildLocalAnalysis(input, result, recommendation), generated: true };
  } catch {
    return { text: staticFallback(input, result), generated: false };
  }
}

function buildLocalAnalysis(
  input: CalculatorInput,
  result: Omit<CalculatorResult, "aiResponse">,
  recommendation: RecommendationContent
): string {
  const level = LEVEL_LABELS[result.potentialLevel].toLowerCase();
  const savings = formatCurrency(result.estimatedMonthlySavings);
  const annual = formatCurrency(result.estimatedAnnualSavings);

  const intro =
    result.estimatedMonthlySavings > 0
      ? `Bonjour ${input.firstName}, selon les informations que tu as fournies, ta situation présente un ${level}. Tu pourrais potentiellement économiser autour de ${savings} par mois, soit environ ${annual} par année.`
      : `Bonjour ${input.firstName}, selon les informations que tu as fournies, ta situation présente un ${level}. Une consolidation ne semble pas réduire tes paiements pour l'instant, mais elle pourrait quand même simplifier ta situation ou réduire le coût total de tes dettes.`;

  return [
    "Résumé simple",
    intro,
    "",
    "Ce que l'estimation veut dire",
    "Ces chiffres sont une estimation basée uniquement sur tes réponses. Les montants réels pourraient varier selon ton dossier de crédit, tes revenus, la valeur exacte de ta propriété et les taux disponibles au moment de la demande.",
    "",
    "Pourquoi ça pourrait valoir la peine d'être analysé",
    recommendation.message,
    "",
    "Prochaine étape recommandée",
    "La meilleure prochaine étape serait d'en discuter avec un courtier hypothécaire qui pourra valider tes options réelles, sans engagement de ta part.",
  ].join("\n");
}

function staticFallback(
  input: CalculatorInput,
  result: Omit<CalculatorResult, "aiResponse">
): string {
  return `Bonjour ${input.firstName}, ton estimation est prête. Selon les informations fournies, ton potentiel d'économie estimé est de ${formatCurrency(
    result.estimatedMonthlySavings
  )} par mois. Cette estimation devrait être validée avec un courtier hypothécaire.`;
}
