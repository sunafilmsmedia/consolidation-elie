import type { CalculatorInput, DebtType } from "@/types/calculator";
import { calculatorConfig } from "./config";

/** Paiement mensuel d'un prêt amorti (formule standard). */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const numberOfPayments = years * 12;

  if (numberOfPayments <= 0) return 0;
  if (monthlyRate === 0) return principal / numberOfPayments;

  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/** Taux moyen estimé des dettes selon les types sélectionnés. */
export function estimateAverageDebtRate(
  debtTypes: DebtType[],
  debtRates: Record<DebtType, number> = calculatorConfig.debtRates
): number {
  const relevant = debtTypes.filter((t) => t !== "none");
  if (!relevant.length) return 0.12;

  const total = relevant.reduce((sum, type) => sum + (debtRates[type] ?? 0.12), 0);
  return total / relevant.length;
}

/** Paiement mensuel actuel : valeur fournie ou estimation (3,5 % du solde). */
export function estimateCurrentDebtPayment(
  totalDebtAmount: number,
  providedPayment?: number
): number {
  if (typeof providedPayment === "number" && providedPayment > 0) {
    return providedPayment;
  }
  return Math.round(totalDebtAmount * calculatorConfig.defaultDebtPaymentFactor);
}

/** Équité disponible (propriétaires seulement). */
export function calculateEquity(propertyValue?: number, mortgageBalance?: number): number {
  if (!propertyValue) return 0;
  return Math.max(propertyValue - (mortgageBalance ?? 0), 0);
}

/** Montant potentiellement disponible au refinancement (LTV max - solde). */
export function calculatePotentialCashAvailable(
  propertyValue: number,
  mortgageBalance: number,
  maxLTV: number = calculatorConfig.maxRefinanceLTV
): number {
  const maxRefinanceAmount = propertyValue * maxLTV;
  return Math.max(maxRefinanceAmount - mortgageBalance, 0);
}

export interface CoreCalculations {
  estimatedAverageDebtRate: number;
  estimatedCurrentDebtPayment: number;
  estimatedConsolidatedRate: number;
  estimatedConsolidatedPayment: number;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  availableEquity?: number;
  maxRefinanceAmount?: number;
  potentialCashAvailable?: number;
  loanToValueRatio?: number;
  refinanceCoverage: "full" | "partial" | "none";
}

/**
 * Calcule l'ensemble des valeurs financières estimées à partir des réponses.
 * Aucune promesse n'est faite ici : tout est estimation, plafonnée à >= 0.
 */
export function runCalculations(input: CalculatorInput): CoreCalculations {
  const {
    debtTypes,
    totalDebtAmount,
    currentDebtMonthlyPayment,
    ownsProperty,
    propertyValue,
    mortgageBalance,
  } = input;

  const estimatedAverageDebtRate = estimateAverageDebtRate(debtTypes);
  const estimatedCurrentDebtPayment = estimateCurrentDebtPayment(
    totalDebtAmount,
    currentDebtMonthlyPayment
  );

  const estimatedConsolidatedRate = calculatorConfig.estimatedMortgageRate;
  const estimatedConsolidatedPayment = calculateMonthlyPayment(
    totalDebtAmount,
    estimatedConsolidatedRate,
    calculatorConfig.amortizationYears
  );

  // Ne jamais afficher une économie négative.
  const rawSavings = estimatedCurrentDebtPayment - estimatedConsolidatedPayment;
  const estimatedMonthlySavings = Math.max(Math.round(rawSavings), 0);
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;

  let availableEquity: number | undefined;
  let maxRefinanceAmount: number | undefined;
  let potentialCashAvailable: number | undefined;
  let loanToValueRatio: number | undefined;
  let refinanceCoverage: "full" | "partial" | "none" = "none";

  if (ownsProperty && propertyValue) {
    const balance = mortgageBalance ?? 0;
    availableEquity = calculateEquity(propertyValue, balance);
    maxRefinanceAmount = propertyValue * calculatorConfig.maxRefinanceLTV;
    potentialCashAvailable = calculatePotentialCashAvailable(propertyValue, balance);
    loanToValueRatio = propertyValue > 0 ? balance / propertyValue : 0;

    if (potentialCashAvailable >= totalDebtAmount && totalDebtAmount > 0) {
      refinanceCoverage = "full";
    } else if (potentialCashAvailable > 0) {
      refinanceCoverage = "partial";
    }
  }

  return {
    estimatedAverageDebtRate,
    estimatedCurrentDebtPayment,
    estimatedConsolidatedRate,
    estimatedConsolidatedPayment: Math.round(estimatedConsolidatedPayment),
    estimatedMonthlySavings,
    estimatedAnnualSavings,
    availableEquity,
    maxRefinanceAmount: maxRefinanceAmount ? Math.round(maxRefinanceAmount) : undefined,
    potentialCashAvailable:
      potentialCashAvailable !== undefined ? Math.round(potentialCashAvailable) : undefined,
    loanToValueRatio,
    refinanceCoverage,
  };
}
