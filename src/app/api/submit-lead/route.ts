import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculatorInputSchema } from "@/lib/validation";
import { processLead } from "@/lib/engine";
import { buildCrmPayload, sendToCrm } from "@/lib/crm";
import { classifySavings } from "@/lib/savingsTier";
import type { CalculatorInput } from "@/types/calculator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const parsed = calculatorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Il manque quelques informations avant de pouvoir générer ton résultat.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const leadId = randomUUID();

  try {
    const { result } = await processLead(input);

    // On donne toujours le résultat (valeur) à la personne. Par contre, un
    // dossier dont l'économie estimée est trop faible (< 300 $/mois) n'est PAS
    // poussé au CRM : ce n'est pas un lead qualifié pour le courtier.
    const tier = classifySavings(result.estimatedMonthlySavings);
    if (tier.isWorthwhile) {
      const crmPayload = buildCrmPayload(input as CalculatorInput, result);
      const crm = await sendToCrm(crmPayload);
      if (!crm.ok) {
        console.error(crm.error);
      }
    } else {
      console.log(
        `[LEAD IGNORÉ] Économie estimée ${result.estimatedMonthlySavings} $/mois < 300 $ — non envoyé au CRM.`
      );
    }

    // TODO: persister dans Supabase (table `leads`) une fois branché.

    return NextResponse.json({
      success: true,
      leadId,
      resultUrl: `/results/${leadId}`,
      result,
    });
  } catch (e) {
    console.error("LEAD_PROCESSING_FAILED", e);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
