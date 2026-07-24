import { SYSTEM_PROMPT, buildUserPrompt, buildDemoPrompt } from "./prompts";

export type GeneratedResponses = {
  sentiment: "positive" | "negative" | "neutral";
  professional: string;
  friendly: string;
  premium: string;
  seo_local: string;
  negative?: string;
};

// Los modelos gratuitos a veces envuelven el JSON en texto o code fences
// (```json ... ```) aunque se pida response_format json_object. Se
// extrae el primer bloque {...} válido antes de fallar.
function parseJsonLoose<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("El modelo no devolvió un JSON válido");
  }
}

async function callOpenRouter(userPrompt: string, maxTokens: number, model = "openrouter/free") {
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
      //
      // Nota: NO se usa response_format:"json_object" porque no todos los
      // modelos gratuitos lo soportan — algunos devuelven contenido vacío
      // en vez de error cuando reciben un parámetro que no manejan. El
      // formato JSON se pide solo por instrucción en el prompt, y se
      // parsea de forma tolerante (parseJsonLoose) por si viene envuelto
      // en texto o code fences.
      model,
      temperature: 0.8,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;
  const modelUsed = data.model;

  if (!raw) {
    // Log completo server-side (Vercel) para poder diagnosticar sin
    // exponer detalles internos al usuario final.
    console.error(
      "OpenRouter devolvió contenido vacío. finish_reason:",
      finishReason,
      "modelo usado:",
      modelUsed,
      "respuesta completa:",
      JSON.stringify(data)
    );
    throw new Error(
      `El modelo (${modelUsed || "desconocido"}) no devolvió contenido. Motivo: ${finishReason || "desconocido"}. Inténtalo de nuevo.`
    );
  }

  return raw as string;
}

// Modelo de respaldo fijo, usado solo si el auto-router gratuito falla.
// Consume saldo real de OpenRouter — por eso es un segundo intento, no
// la primera opción.
const FALLBACK_MODEL = "anthropic/claude-haiku-4.5";

async function callOpenRouterWithFallback(userPrompt: string, maxTokens: number) {
  try {
    return await callOpenRouter(userPrompt, maxTokens, "openrouter/free");
  } catch (err) {
    console.error("Fallo con openrouter/free, reintentando con modelo de pago:", err);
    return await callOpenRouter(userPrompt, maxTokens, FALLBACK_MODEL);
  }
}

export async function generateResponses(
  businessType: string,
  reviewText: string
): Promise<GeneratedResponses> {
  const raw = await callOpenRouterWithFallback(buildUserPrompt(businessType, reviewText), 1200);
  return parseJsonLoose<GeneratedResponses>(raw);
}

// Versión reducida para la demo pública (sin login): una sola respuesta,
// menos tokens, más barata. Pensada para tráfico anónimo de la landing.
// Sin fallback de pago: si el modelo gratuito falla, la demo simplemente
// da error — no queremos gastar saldo real en tráfico anónimo sin login.
export async function generateDemoResponse(
  businessType: string,
  reviewText: string
): Promise<string> {
  const raw = await callOpenRouter(buildDemoPrompt(businessType, reviewText), 300);
  const parsed = parseJsonLoose<{ reply: string }>(raw);
  return parsed.reply;
}
