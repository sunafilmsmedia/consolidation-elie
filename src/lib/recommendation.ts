import type { CalculatorInput, DebtType, RecommendationType } from "@/types/calculator";
import type { CoreCalculations } from "./calculations";

export interface RecommendationContent {
  type: RecommendationType;
  message: string;
  cta: string;
  strategyLabel: string;
}

const HIGH_RATE_DEBTS: DebtType[] = ["credit_card", "personal_loan"];

export function determineRecommendation(
  input: CalculatorInput,
  calc: CoreCalculations
): RecommendationContent {
  // E — En processus d'achat
  if (input.userStatus === "buying_process") {
    return {
      type: "buying_process",
      strategyLabel: "Préparation avant achat",
      message:
        "Si tu veux acheter une propriété bientôt, tes dettes actuelles peuvent influencer ta capacité d'emprunt. Une consolidation bien structurée pourrait parfois améliorer ton dossier avant l'achat, mais elle doit être analysée correctement.",
      cta: "Parler à un courtier avant d'acheter",
    };
  }

  if (input.ownsProperty) {
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
        "Selon les informations fournies, il ne semble pas y avoir beaucoup d'équité disponible pour un refinancement complet. Par contre, il peut exister d'autres solutions selon ton dossier, ton revenu et ta situation hypothécaire.",
      cta: "Demander une analyse personnalisée",
    };
  }

  // D — Locataire avec dettes à taux élevé
  const hasHighRateDebt = input.debtTypes.some((t) => HIGH_RATE_DEBTS.includes(t));
  if (!input.ownsProperty && input.totalDebtAmount > 10000 && hasHighRateDebt) {
    return {
      type: "non_mortgage_consolidation",
      strategyLabel: "Consolidation non hypothécaire",
      message:
        "Comme tu n'es pas propriétaire, le refinancement hypothécaire ne s'applique probablement pas à ta situation. Par contre, il pourrait exister d'autres options de consolidation non hypothécaire pour réduire tes paiements ou simplifier tes dettes.",
      cta: "Recevoir mes options",
    };
  }

  // Fallback — analyse générale
  return {
    type: "general_review",
    strategyLabel: "Analyse générale",
    message:
      "Selon tes réponses, une analyse plus complète permettrait de mieux cerner les options qui pourraient s'offrir à toi pour réduire ou simplifier tes paiements.",
    cta: "Recevoir mes options",
  };
}
