import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculatorInputSchema } from "@/lib/validation";
import { processLead } from "@/lib/engine";
import { buildCrmPayload, sendToCrm } from "@/lib/crm";
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
    // Honeypot rempli => spam : on répond 200 sans rien faire.
    if (
      typeof body === "object" &&
      body !== null &&
      "company" in body &&
      (body as { company?: string }).company
    ) {
      return NextResponse.json({ success: true, leadId: "ignored", resultUrl: "/" });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Il manque quelques informations avant de pouvoir générer ton résultat.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // On retire le honeypot avant de traiter.
  const { company: _company, ...input } = parsed.data;
  const leadId = randomUUID();

  try {
    const { result } = await processLead(input as CalculatorInput);

    // Construction + envoi CRM (stub). Un échec ne bloque pas l'utilisateur.
    const crmPayload = buildCrmPayload(input as CalculatorInput, result);
    const crm = await sendToCrm(crmPayload);
    if (!crm.ok) {
      console.error(crm.error);
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
