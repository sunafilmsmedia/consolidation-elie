import Anthropic from "@anthropic-ai/sdk";
import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { LEVEL_LABELS } from "./scoring";
import {
  formatCurrency,
  DEBT_TYPE_LABELS,
  PRIMARY_GOAL_LABELS,
  USER_STATUS_LABELS,
} from "./format";
import type { RecommendationContent } from "./recommendation";

/**
 * Génération de la réponse IA personnalisée (côté serveur uniquement).
 *
 * Si ANTHROPIC_API_KEY est défini, on appelle l'API Anthropic (Claude). Sinon
 * (ou en cas d'échec), on retombe proprement sur un texte construit localement —
 * le formulaire ne casse jamais et l'utilisateur voit toujours un résultat.
 */

// Modèle configurable via env. Par défaut Claude Opus 4.8 ; pour réduire les
// coûts sur cette tâche courte, mettre ANTHROPIC_MODEL=claude-haiku-4-5.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

export const SYSTEM_PROMPT = `Tu es un assistant spécialisé en vulgarisation hypothécaire pour un courtier hypothécaire au Canada.
Ton rôle est d'expliquer simplement à l'utilisateur son potentiel d'économie par consolidation de dettes ou refinancement hypothécaire.
Tu dois être clair, rassurant et prudent.
Tu ne dois jamais promettre une approbation.
Tu ne dois jamais garantir une économie.
Tu ne dois jamais dire que l'utilisateur est admissible avec certitude.
Tu dois toujours préciser que le résultat est une estimation basée sur les informations fournies.
Tu dois encourager l'utilisateur à valider sa situation avec un courtier hypothécaire.
Écris dans un français québécois professionnel, simple et humain. Ne sois pas trop technique.
Maximum 220 mots. Structure ta réponse en 4 sections avec ces titres exacts, chacun sur sa propre ligne :
Résumé simple
Ce que l'estimation veut dire
Pourquoi ça pourrait valoir la peine d'être analysé
Prochaine étape recommandée`;

export interface AIResult {
  text: string;
  generated: boolean;
}

export async function generateAnalysis(
  input: CalculatorInput,
  result: Omit<CalculatorResult, "aiResponse">,
  recommendation: RecommendationContent
): Promise<AIResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Pas de clé : mode local (stub) — texte déterministe.
  if (!apiKey) {
    return { text: buildLocalAnalysis(input, result, recommendation), generated: false };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(input, result, recommendation) },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("Réponse IA vide");
    return { text, generated: true };
  } catch (e) {
    console.error("AI_GENERATION_FAILED", e);
    return { text: buildLocalAnalysis(input, result, recommendation), generated: false };
  }
}

function buildUserPrompt(
  input: CalculatorInput,
  result: Omit<CalculatorResult, "aiResponse">,
  recommendation: RecommendationContent
): string {
  const debts = input.debtTypes.map((t) => DEBT_TYPE_LABELS[t]).join(", ");
  return `Voici les données d'un utilisateur ayant complété un calculateur de consolidation de dettes :

Prénom : ${input.firstName}
Statut : ${USER_STATUS_LABELS[input.userStatus]}
Objectif principal : ${PRIMARY_GOAL_LABELS[input.primaryGoal]}
Types de dettes : ${debts}
Montant total des dettes : ${formatCurrency(input.totalDebtAmount)}
Paiements mensuels actuels estimés : ${formatCurrency(result.estimatedCurrentDebtPayment)}
Valeur de propriété : ${input.propertyValue ? formatCurrency(input.propertyValue) : "n/a"}
Solde hypothécaire : ${input.mortgageBalance ? formatCurrency(input.mortgageBalance) : "n/a"}
Équité disponible estimée : ${result.availableEquity ? formatCurrency(result.availableEquity) : "n/a"}
Montant potentiellement disponible au refinancement : ${
    result.potentialCashAvailable ? formatCurrency(result.potentialCashAvailable) : "n/a"
  }
Économie mensuelle estimée : ${formatCurrency(result.estimatedMonthlySavings)}
Économie annuelle estimée : ${formatCurrency(result.estimatedAnnualSavings)}
Score de potentiel : ${result.savingsScore}/100
Niveau de potentiel : ${LEVEL_LABELS[result.potentialLevel]}
Type de recommandation interne : ${recommendation.message}

Génère la réponse personnalisée en 4 sections (titres exacts demandés dans tes consignes).
Utilise toujours des termes comme « pourrait », « semble », « estimation », « à valider ».
Ne garantis jamais le résultat et ne dis jamais que la personne est approuvée.`;
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
