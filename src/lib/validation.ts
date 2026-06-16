import { z } from "zod";

const phoneRegex = /^[+]?[\d\s().-]{10,20}$/;

export const calculatorInputSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prénom est requis"),
    lastName: z.string().trim().optional(),
    email: z.string().trim().email("Courriel invalide"),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Numéro de téléphone invalide"),

    userStatus: z.enum(["owner", "renter", "buying_process", "unsure"]),
    primaryGoal: z.enum([
      "reduce_monthly_payments",
      "combine_debts",
      "pay_less_interest",
      "free_cashflow",
      "prepare_home_purchase",
      "explore_options",
    ]),
    debtTypes: z
      .array(
        z.enum([
          "credit_card",
          "personal_loan",
          "line_of_credit",
          "car_loan",
          "student_loan",
          "buy_now_pay_later",
          "tax_debt",
          "other",
          "none",
        ])
      )
      .min(1, "Sélectionne au moins une option"),

    totalDebtAmount: z.number().nonnegative(),
    currentDebtMonthlyPayment: z.number().nonnegative().optional(),

    ownsProperty: z.boolean(),
    hasMortgage: z.boolean().optional(),
    propertyValue: z.number().nonnegative().optional(),
    mortgageBalance: z.number().nonnegative().optional(),
    mortgageMonthlyPayment: z.number().nonnegative().optional(),

    householdIncomeRange: z.string().optional(),
    urgencyLevel: z.string().min(1),
    consentContact: z.literal(true, {
      errorMap: () => ({ message: "Le consentement est requis" }),
    }),

    // Honeypot anti-spam : doit rester vide.
    company: z.string().max(0).optional(),
  })
  .refine((d) => !d.ownsProperty || d.propertyValue !== undefined, {
    message: "La valeur de la propriété est requise pour les propriétaires",
    path: ["propertyValue"],
  });

export type ValidatedCalculatorInput = z.infer<typeof calculatorInputSchema>;
