import type { CalculatorInput, DebtType, PotentialLevel } from "@/types/calculator";

function statusPoints(input: CalculatorInput): number {
  switch (input.userStatus) {
    case "owner":
      return 20;
    case "buying_process":
      return 5;
    default:
      return 0;
  }
}

function debtAmountPoints(amount: number): number {
  if (amount >= 100000) return 40;
  if (amount >= 50000) return 30;
  if (amount >= 25000) return 20;
  if (amount >= 10000) return 10;
  if (amount >= 5000) return 5;
  return 0;
}

function monthlyPaymentPoints(payment: number): number {
  if (payment >= 1500) return 40;
  if (payment >= 1000) return 30;
  if (payment >= 600) return 20;
  if (payment >= 300) return 10;
  return 0;
}

const DEBT_TYPE_POINTS: Partial<Record<DebtType, number>> = {
  credit_card: 15,
  personal_loan: 10,
  line_of_credit: 5,
  car_loan: 5,
  tax_debt: 10,
  buy_now_pay_later: 10,
};

function debtTypePoints(types: DebtType[]): number {
  return types.reduce((sum, t) => sum + (DEBT_TYPE_POINTS[t] ?? 0), 0);
}

function equityPoints(availableEquity?: number): number {
  const e = availableEquity ?? 0;
  if (e >= 100000) return 40;
  if (e >= 50000) return 30;
  if (e >= 25000) return 20;
  if (e >= 10000) return 10;
  if (e >= 1) return 5;
  return 0;
}

function urgencyPoints(urgency: string): number {
  switch (urgency) {
    case "asap":
      return 20;
    case "weeks":
      return 15;
    case "months":
      return 5;
    default:
      return 0;
  }
}

export interface ScoreParams {
  estimatedCurrentDebtPayment: number;
  availableEquity?: number;
}

/** Score de potentiel de 0 à 100. */
export function calculateSavingsScore(input: CalculatorInput, params: ScoreParams): number {
  const total =
    statusPoints(input) +
    debtAmountPoints(input.totalDebtAmount) +
    monthlyPaymentPoints(params.estimatedCurrentDebtPayment) +
    debtTypePoints(input.debtTypes) +
    equityPoints(params.availableEquity) +
    urgencyPoints(input.urgencyLevel);

  return Math.min(total, 100);
}

export function scoreToLevel(score: number): PotentialLevel {
  if (score <= 20) return "low";
  if (score <= 40) return "moderate";
  if (score <= 60) return "good";
  if (score <= 80) return "strong";
  return "very_strong";
}

export const LEVEL_LABELS: Record<PotentialLevel, string> = {
  low: "Potentiel faible",
  moderate: "Potentiel modéré",
  good: "Bon potentiel",
  strong: "Fort potentiel",
  very_strong: "Très fort potentiel",
};

export const LEVEL_DESCRIPTIONS: Record<PotentialLevel, string> = {
  low: "Tes économies pourraient être limitées, mais une analyse complète peut quand même révéler des options.",
  moderate: "Il pourrait y avoir certaines optimisations possibles selon ta situation.",
  good: "Ta situation montre des signes intéressants pour une consolidation.",
  strong: "Tu pourrais avoir une vraie opportunité de réduire tes paiements mensuels.",
  very_strong:
    "Ta situation semble très intéressante pour une analyse de consolidation ou refinancement.",
};
