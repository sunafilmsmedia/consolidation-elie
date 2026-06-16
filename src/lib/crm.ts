import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import { LEVEL_LABELS } from "./scoring";
import {
  DEBT_TYPE_LABELS,
  PRIMARY_GOAL_LABELS,
  URGENCY_LABELS,
  USER_STATUS_LABELS,
} from "./format";

/**
 * Payload CRM (format GoHighLevel) construit à partir du lead.
 * C'est l'objet que le courtier veut récupérer.
 */
export interface CrmPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, string | number>;
}

function levelTag(level: CalculatorResult["potentialLevel"]): string {
  const map: Record<CalculatorResult["potentialLevel"], string> = {
    low: "Potentiel - Faible",
    moderate: "Potentiel - Moyen",
    good: "Potentiel - Bon",
    strong: "Potentiel - Fort",
    very_strong: "Potentiel - Très fort",
  };
  return map[level];
}

export function buildCrmPayload(
  input: CalculatorInput,
  result: CalculatorResult
): CrmPayload {
  const tags = [
    "Lead - Calculateur consolidation",
    levelTag(result.potentialLevel),
    input.ownsProperty ? "Propriétaire" : "Locataire",
  ];

  if (result.recommendationType === "refinance_full") tags.push("Refinancement possible");
  if (result.recommendationType === "refinance_partial") tags.push("Consolidation partielle");
  if (input.urgencyLevel === "asap") tags.push("Urgent");
  if (input.urgencyLevel === "curious") tags.push("Curieux");

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    tags,
    customFields: {
      userStatus: USER_STATUS_LABELS[input.userStatus],
      primaryGoal: PRIMARY_GOAL_LABELS[input.primaryGoal],
      debtTypes: input.debtTypes.map((t) => DEBT_TYPE_LABELS[t]).join(", "),
      totalDebtAmount: input.totalDebtAmount,
      monthlyDebtPayment: result.estimatedCurrentDebtPayment,
      estimatedMonthlySavings: result.estimatedMonthlySavings,
      estimatedAnnualSavings: result.estimatedAnnualSavings,
      propertyValue: input.propertyValue ?? 0,
      mortgageBalance: input.mortgageBalance ?? 0,
      potentialCashAvailable: result.potentialCashAvailable ?? 0,
      savingsScore: result.savingsScore,
      potentialLevel: LEVEL_LABELS[result.potentialLevel],
      urgencyLevel: URGENCY_LABELS[input.urgencyLevel] ?? input.urgencyLevel,
      aiResponse: result.aiResponse,
    },
  };
}

export interface CrmSyncResult {
  ok: boolean;
  error?: string;
}

/**
 * Envoi du lead au CRM.
 *
 * --- STUB ---
 * Si CRM_WEBHOOK_URL est défini, on POST réellement le payload.
 * Sinon, on log côté serveur et on retourne ok. Un échec CRM ne doit
 * jamais bloquer l'utilisateur (le lead est quand même retourné/sauvé).
 */
export async function sendToCrm(payload: CrmPayload): Promise<CrmSyncResult> {
  const webhook = process.env.CRM_WEBHOOK_URL;

  if (!webhook) {
    console.log("[CRM STUB] Lead prêt à être envoyé:", JSON.stringify(payload, null, 2));
    return { ok: true };
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `CRM_SYNC_FAILED: HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `CRM_SYNC_FAILED: ${(e as Error).message}` };
  }
}
