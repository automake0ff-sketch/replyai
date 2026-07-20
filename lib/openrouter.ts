import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

export type GeneratedResponses = {
  sentiment: "positive" | "negative" | "neutral";
  professional: string;
  friendly: string;
  premium: string;
  seo_local: string;
  negative?: string;
};

export async function generateResponses(
  businessType: string,
  reviewText: string
): Promise<GeneratedResponses> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4.5",
      temperature: 0.8,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(businessType, reviewText) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) throw new Error("Respuesta vacía del modelo");

  try {
    return JSON.parse(raw) as GeneratedResponses;
  } catch {
    throw new Error("El modelo no devolvió un JSON válido");
  }
}
