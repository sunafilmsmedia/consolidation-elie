import type {
  DebtType,
  PrimaryGoal,
  UserStatus,
} from "@/types/calculator";

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toLocaleString("fr-CA", { maximumFractionDigits: 2 })} %`;
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  owner: "Propriétaire",
  renter: "Locataire",
  buying_process: "En processus d'achat",
  unsure: "Incertain",
};

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  reduce_monthly_payments: "Réduire mes paiements mensuels",
  combine_debts: "Regrouper plusieurs dettes",
  pay_less_interest: "Payer moins d'intérêts",
  free_cashflow: "Libérer de l'argent chaque mois",
  prepare_home_purchase: "Améliorer ma situation avant un achat",
  explore_options: "Voir mes options",
};

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  credit_card: "Cartes de crédit",
  personal_loan: "Prêts personnels",
  line_of_credit: "Marge de crédit",
  car_loan: "Prêt automobile",
  student_loan: "Prêt étudiant",
  buy_now_pay_later: "Achat maintenant / paiement plus tard",
  tax_debt: "Dettes fiscales",
  other: "Autre",
  none: "Aucune dette importante",
};

export const URGENCY_LABELS: Record<string, string> = {
  asap: "Le plus vite possible",
  weeks: "Dans les prochaines semaines",
  months: "Dans les prochains mois",
  curious: "Seulement curieux",
};

export const INCOME_LABELS: Record<string, string> = {
  under_40k: "Moins de 40 000 $",
  "40k_60k": "40 000 $ à 60 000 $",
  "60k_80k": "60 000 $ à 80 000 $",
  "80k_120k": "80 000 $ à 120 000 $",
  "120k_180k": "120 000 $ à 180 000 $",
  over_180k: "Plus de 180 000 $",
  no_answer: "Préfère ne pas répondre",
};
