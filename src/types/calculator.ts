export type UserStatus = "owner" | "renter" | "buying_process" | "unsure";

export type PrimaryGoal =
  | "reduce_monthly_payments"
  | "combine_debts"
  | "pay_less_interest"
  | "free_cashflow"
  | "prepare_home_purchase"
  | "explore_options";

export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "line_of_credit"
  | "car_loan"
  | "student_loan"
  | "buy_now_pay_later"
  | "tax_debt"
  | "other"
  | "none";

export type PotentialLevel = "low" | "moderate" | "good" | "strong" | "very_strong";

export type RecommendationType =
  | "refinance_full"
  | "refinance_partial"
  | "not_enough_equity"
  | "non_mortgage_consolidation"
  | "buying_process"
  | "general_review";

export interface CalculatorInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;

  userStatus: UserStatus;
  primaryGoal: PrimaryGoal;
  debtTypes: DebtType[];

  totalDebtAmount: number;
  currentDebtMonthlyPayment?: number;

  ownsProperty: boolean;
  hasMortgage?: boolean;
  propertyValue?: number;
  mortgageBalance?: number;
  mortgageMonthlyPayment?: number;

  householdIncomeRange?: string;
  urgencyLevel: string;
  consentContact: boolean;
}

export interface CalculatorResult {
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

  savingsScore: number;
  potentialLevel: PotentialLevel;
  recommendationType: RecommendationType;

  aiResponse: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  leadId: string;
  resultUrl: string;
  result: CalculatorResult;
}
