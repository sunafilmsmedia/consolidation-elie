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

  // Coordonnées du courtier.
  brokerName: "Elie Ibrahim",
  brokerTitle: "Courtier hypothécaire",
  brokerPhone: "819 210 7843",
  calendarLink:
    "https://crm.zoho.com/bookings/45minutesmeeting?rid=219159cc419e076603afc06b48b52fd146f0ed91ee1c98866d53bfc67adb5a84gidc5b9b07733f51932b85173ba8a5fd05e285176fa3990ece848a658a889ae29c4",
};

export type CalculatorConfig = typeof calculatorConfig;
