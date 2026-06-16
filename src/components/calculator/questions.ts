import type {
  DebtType,
  PrimaryGoal,
  UserStatus,
} from "@/types/calculator";

export interface ChoiceOption<T = string> {
  label: string;
  value: T;
}

export const USER_STATUS_OPTIONS: ChoiceOption<UserStatus>[] = [
  { label: "Je suis propriétaire", value: "owner" },
  { label: "Je suis locataire", value: "renter" },
  { label: "Je suis en processus d'achat", value: "buying_process" },
  { label: "Je ne suis pas certain", value: "unsure" },
];

export const PRIMARY_GOAL_OPTIONS: ChoiceOption<PrimaryGoal>[] = [
  { label: "Réduire mes paiements mensuels", value: "reduce_monthly_payments" },
  { label: "Regrouper plusieurs dettes en un seul paiement", value: "combine_debts" },
  { label: "Payer moins d'intérêts", value: "pay_less_interest" },
  { label: "Libérer de l'argent chaque mois", value: "free_cashflow" },
  { label: "Améliorer ma situation avant un achat immobilier", value: "prepare_home_purchase" },
  { label: "Je veux juste voir mes options", value: "explore_options" },
];

export const DEBT_TYPE_OPTIONS: ChoiceOption<DebtType>[] = [
  { label: "Cartes de crédit", value: "credit_card" },
  { label: "Prêt personnel", value: "personal_loan" },
  { label: "Marge de crédit", value: "line_of_credit" },
  { label: "Prêt automobile", value: "car_loan" },
  { label: "Autre", value: "other" },
  { label: "Aucune dette importante", value: "none" },
];

// Plages avec valeur représentative (point médian) pour le calcul.
export const DEBT_AMOUNT_OPTIONS: ChoiceOption<number>[] = [
  { label: "Moins de 5 000 $", value: 3500 },
  { label: "5 000 $ à 10 000 $", value: 7500 },
  { label: "10 000 $ à 25 000 $", value: 17500 },
  { label: "25 000 $ à 50 000 $", value: 37500 },
  { label: "50 000 $ à 100 000 $", value: 75000 },
  { label: "Plus de 100 000 $", value: 120000 },
];

export const PROPERTY_VALUE_OPTIONS: ChoiceOption<number>[] = [
  { label: "Moins de 300 000 $", value: 250000 },
  { label: "300 000 $ à 500 000 $", value: 400000 },
  { label: "500 000 $ à 750 000 $", value: 625000 },
  { label: "750 000 $ à 1 000 000 $", value: 875000 },
  { label: "1 000 000 $ et plus", value: 1100000 },
];

export const MORTGAGE_BALANCE_OPTIONS: ChoiceOption<number>[] = [
  { label: "Moins de 100 000 $", value: 75000 },
  { label: "100 000 $ à 250 000 $", value: 175000 },
  { label: "250 000 $ à 400 000 $", value: 325000 },
  { label: "400 000 $ à 600 000 $", value: 500000 },
  { label: "600 000 $ et plus", value: 700000 },
];

export const HAS_MORTGAGE_OPTIONS: ChoiceOption<string>[] = [
  { label: "Oui", value: "yes" },
  { label: "Non, ma propriété est payée", value: "no" },
  { label: "Je ne suis pas certain", value: "unsure" },
];

export const INCOME_OPTIONS: ChoiceOption<string>[] = [
  { label: "Moins de 40 000 $", value: "under_40k" },
  { label: "40 000 $ à 60 000 $", value: "40k_60k" },
  { label: "60 000 $ à 80 000 $", value: "60k_80k" },
  { label: "80 000 $ à 120 000 $", value: "80k_120k" },
  { label: "120 000 $ à 180 000 $", value: "120k_180k" },
  { label: "Plus de 180 000 $", value: "over_180k" },
  { label: "Je préfère ne pas répondre", value: "no_answer" },
];

export const URGENCY_OPTIONS: ChoiceOption<string>[] = [
  { label: "Le plus vite possible", value: "asap" },
  { label: "Dans les prochaines semaines", value: "weeks" },
  { label: "Dans les prochains mois", value: "months" },
  { label: "Je suis seulement curieux", value: "curious" },
];
