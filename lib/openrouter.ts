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
      // Router gratuito de OpenRouter: elige automáticamente entre los
      // modelos :free disponibles ahora mismo (la lista cambia con
      // frecuencia). Límite: 50 peticiones/día sin saldo, sube a 1000/día
      // con solo $10 de crédito. Para producción con volumen real, cambia
      // esto por un modelo de pago fijo (ej. "anthropic/claude-haiku-4.5").
      model: "openrouter/free",
      temperature: 0.8,
      max_tokens: 1200,
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

  // Los modelos gratuitos a veces envuelven el JSON en texto o code fences
  // (```json ... ```) aunque se pida response_format json_object. Se
  // extrae el primer bloque {...} válido antes de fallar.
  function parseJsonLoose(text: string): GeneratedResponses {
    try {
      return JSON.parse(text) as GeneratedResponses;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as GeneratedResponses;
      }
      throw new Error("El modelo no devolvió un JSON válido");
    }
  }

  return parseJsonLoose(raw);
}
