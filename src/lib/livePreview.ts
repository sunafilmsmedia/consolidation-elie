import type { CalculatorInput } from "@/types/calculator";
import { runCalculations } from "./calculations";
import { calculateSavingsScore, scoreToLevel } from "./scoring";
import type { PotentialLevel } from "@/types/calculator";

export interface LivePreview {
  score: number;
  level: PotentialLevel | null;
  hasEnoughInfo: boolean;
}

/**
 * Score approximatif côté client pour faire évoluer le thermomètre
 * au fil des réponses, SANS afficher de montant précis.
 * Retourne hasEnoughInfo=false tant qu'on n'a pas assez de données.
 */
export function computeLivePreview(answers: Partial<CalculatorInput>): LivePreview {
  const hasEnoughInfo =
    answers.userStatus !== undefined &&
    answers.debtTypes !== undefined &&
    answers.debtTypes.length > 0 &&
    typeof answers.totalDebtAmount === "number";

  if (!hasEnoughInfo) {
    return { score: 0, level: null, hasEnoughInfo: false };
  }

  const input: CalculatorInput = {
    firstName: answers.firstName ?? "",
    email: answers.email ?? "",
    phone: answers.phone ?? "",
    userStatus: answers.userStatus!,
    primaryGoal: answers.primaryGoal ?? "explore_options",
    debtTypes: answers.debtTypes!,
    totalDebtAmount: answers.totalDebtAmount ?? 0,
    currentDebtMonthlyPayment: answers.currentDebtMonthlyPayment,
    ownsProperty: answers.ownsProperty ?? false,
    hasMortgage: answers.hasMortgage,
    propertyValue: answers.propertyValue,
    mortgageBalance: answers.mortgageBalance,
    mortgageMonthlyPayment: answers.mortgageMonthlyPayment,
    householdIncomeRange: answers.householdIncomeRange,
    urgencyLevel: answers.urgencyLevel ?? "",
    consentContact: true,
  };

  const calc = runCalculations(input);
  const score = calculateSavingsScore(input, {
    estimatedCurrentDebtPayment: calc.estimatedCurrentDebtPayment,
    availableEquity: calc.availableEquity,
  });

  return { score, level: scoreToLevel(score), hasEnoughInfo: true };
}
