import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Diagnostic — ne renvoie JAMAIS la clé, seulement son état.
 * À retirer une fois l'intégration OpenAI confirmée.
 */
export async function GET() {
  const key = process.env.OPENAI_API_KEY;

  const status: Record<string, unknown> = {
    hasKey: !!key,
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.slice(0, 7) : null,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  };

  if (!key) {
    status.openai = "NO_KEY — la variable OPENAI_API_KEY n'est pas lue par cette fonction";
    return NextResponse.json(status);
  }

  try {
    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_tokens: 5,
      messages: [{ role: "user", content: "Réponds juste: OK" }],
    });
    status.openai = "OK";
    status.sample = completion.choices[0]?.message?.content ?? null;
  } catch (e) {
    const err = e as { status?: number; code?: string; message?: string };
    status.openai = "ERROR";
    status.errorStatus = err.status ?? null;
    status.errorCode = err.code ?? null;
    status.errorMessage = err.message ?? String(e);
  }

  return NextResponse.json(status);
}
