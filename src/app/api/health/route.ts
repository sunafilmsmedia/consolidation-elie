import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Diagnostic — ne renvoie JAMAIS la clé, seulement son état.
 * À retirer une fois l'intégration confirmée.
 */
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

  const status: Record<string, unknown> = {
    hasKey: !!key,
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.slice(0, 10) : null,
    model,
  };

  if (!key) {
    status.anthropic = "NO_KEY — la variable ANTHROPIC_API_KEY n'est pas lue par cette fonction";
    return NextResponse.json(status);
  }

  try {
    const anthropic = new Anthropic({ apiKey: key });
    const message = await anthropic.messages.create({
      model,
      max_tokens: 16,
      messages: [{ role: "user", content: "Réponds juste: OK" }],
    });
    status.anthropic = "OK";
    status.sample = message.content.find((b) => b.type === "text")?.text ?? null;
  } catch (e) {
    const err = e as { status?: number; error?: { error?: { type?: string } }; message?: string };
    status.anthropic = "ERROR";
    status.errorStatus = err.status ?? null;
    status.errorType = err.error?.error?.type ?? null;
    status.errorMessage = err.message ?? String(e);
  }

  return NextResponse.json(status);
}
