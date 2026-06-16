import type { DebtType } from "@/types/calculator";

/**
 * Configuration globale du calculateur.
 * Ces valeurs sont destinées à être éditables par l'admin / courtier
 * (idéalement via la table `app_config` une fois Supabase branché).
 */
export const calculatorConfig = {
  estimatedMortgageRate: 0.0549,
  amortizationYears: 25,
  maxRefinanceLTV: 0.8,

  debtRates: {
    credit_card: 0.1999,
    personal_loan: 0.0999,
    line_of_credit: 0.0899,
    car_loan: 0.0799,
    student_loan: 0.0599,
    buy_now_pay_later: 0.15,
    tax_debt: 0.1,
    other: 0.12,
    none: 0,
  } as Record<DebtType, number>,

  // Facteur de paiement mensuel estimé quand l'utilisateur ne connaît pas
  // son paiement (3,5 % du solde total).
  defaultDebtPaymentFactor: 0.035,
  minDebtPaymentFactor: 0.025,
  maxDebtPaymentFactor: 0.05,

  // Économie minimale affichée pour éviter d'afficher des micro-montants.
  minimumDisplayedSavings: 50,

  // Coordonnées du courtier (placeholders).
  brokerName: "Ton courtier hypothécaire",
  calendarLink: "https://calendly.com/ton-courtier/consultation",
};

export type CalculatorConfig = typeof calculatorConfig;
