import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { runCalculations } from "./calculations";
import { calculateSavingsScore, scoreToLevel } from "./scoring";
import { determineRecommendation } from "./recommendation";
import { generateAnalysis } from "./ai";

export interface EngineOutput {
  result: CalculatorResult;
  aiGenerated: boolean;
}

/**
 * Pipeline complet : calculs -> score -> recommandation -> texte IA.
 * Utilisé côté serveur dans /api/submit-lead.
 */
export async function processLead(input: CalculatorInput): Promise<EngineOutput> {
  const calc = runCalculations(input);

  const savingsScore = calculateSavingsScore(input, {
    estimatedCurrentDebtPayment: calc.estimatedCurrentDebtPayment,
    availableEquity: calc.availableEquity,
  });
  const potentialLevel = scoreToLevel(savingsScore);

  const recommendation = determineRecommendation(input, calc);

  const partial: Omit<CalculatorResult, "aiResponse"> = {
    estimatedAverageDebtRate: calc.estimatedAverageDebtRate,
    estimatedCurrentDebtPayment: calc.estimatedCurrentDebtPayment,
    estimatedConsolidatedRate: calc.estimatedConsolidatedRate,
    estimatedConsolidatedPayment: calc.estimatedConsolidatedPayment,
    estimatedMonthlySavings: calc.estimatedMonthlySavings,
    estimatedAnnualSavings: calc.estimatedAnnualSavings,
    availableEquity: calc.availableEquity,
    maxRefinanceAmount: calc.maxRefinanceAmount,
    potentialCashAvailable: calc.potentialCashAvailable,
    loanToValueRatio: calc.loanToValueRatio,
    savingsScore,
    potentialLevel,
    recommendationType: recommendation.type,
  };

  const ai = await generateAnalysis(input, partial, recommendation);

  return {
    result: { ...partial, aiResponse: ai.text },
    aiGenerated: ai.generated,
  };
}
