import type { CalculatorInput, RecommendationType } from "@/types/calculator";
import type { CoreCalculations } from "./calculations";

export interface RecommendationContent {
  type: RecommendationType;
  message: string;
  cta: string;
  strategyLabel: string;
}

// L'outil est réservé aux propriétaires : la recommandation dépend uniquement
// de l'équité disponible (montant potentiellement dégageable au refinancement).
export function determineRecommendation(
  input: CalculatorInput,
  calc: CoreCalculations
): RecommendationContent {
  const cash = calc.potentialCashAvailable ?? 0;

  // A — Refinancement complet
  if (cash >= input.totalDebtAmount && calc.estimatedMonthlySavings > 0) {
    return {
      type: "refinance_full",
      strategyLabel: "Consolidation par refinancement",
      message:
        "Ta situation semble très intéressante pour une consolidation par refinancement. Selon les informations fournies, tu pourrais potentiellement regrouper tes dettes dans ton hypothèque et réduire tes paiements mensuels.",
      cta: "Parler à un courtier pour valider mes options",
    };
  }

  // B — Consolidation partielle
  if (cash > 0 && cash < input.totalDebtAmount) {
    return {
      type: "refinance_partial",
      strategyLabel: "Consolidation partielle",
      message:
        "Tu pourrais avoir une partie d'équité disponible, mais elle ne semble peut-être pas suffisante pour consolider toutes tes dettes. Une stratégie partielle pourrait quand même réduire une partie de tes paiements.",
      cta: "Voir quelle stratégie serait possible",
    };
  }

  // C — Pas assez d'équité
  return {
    type: "not_enough_equity",
    strategyLabel: "Analyse personnalisée requise",
    message:
      "Selon les informations fournies, il ne semble pas y avoir beaucoup d'équité disponible pour un refinancement. Ton solde hypothécaire est peut-être encore élevé par rapport à la valeur de ta propriété. Par contre, il peut exister d'autres solutions selon ton dossier, ton revenu et ta situation.",
    cta: "Demander une analyse personnalisée",
  };
}
