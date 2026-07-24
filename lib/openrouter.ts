import { SYSTEM_PROMPT, buildUserPrompt, buildDemoPrompt } from "./prompts";

export type GeneratedResponses = {
  sentiment: "positive" | "negative" | "neutral";
  professional: string;
  friendly: string;
  premium: string;
  seo_local: string;
  negative?: string;
};

// Extrae contenido entre [TAG]...[/TAG]. Mucho más tolerante que JSON.parse
// para modelos gratuitos débiles: no requiere escapar comillas ni saltos de
// línea, y un modelo que añade texto de más alrededor no rompe el parseo.
function extractTag(text: string, tag: string): string | undefined {
  const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "i");
  const match = text.match(regex);
  return match?.[1]?.trim();
}

function parseTaggedResponses(text: string): GeneratedResponses {
  const professional = extractTag(text, "PROFESSIONAL");
  const friendly = extractTag(text, "FRIENDLY");
  const premium = extractTag(text, "PREMIUM");
  const seoLocal = extractTag(text, "SEO_LOCAL");
  const negative = extractTag(text, "NEGATIVE");
  const sentimentRaw = extractTag(text, "SENTIMENT")?.toLowerCase();

  if (!professional || !friendly || !premium || !seoLocal) {
    throw new Error("El modelo no devolvió el formato esperado");
  }

  const sentiment: GeneratedResponses["sentiment"] =
    sentimentRaw === "negative" ? "negative" : sentimentRaw === "neutral" ? "neutral" : "positive";

  return {
    sentiment,
    professional,
    friendly,
    premium,
    seo_local: seoLocal,
    ...(negative ? { negative } : {}),
  };
}

function parseTaggedDemo(text: string): { reply: string } {
  const reply = extractTag(text, "REPLY");
  if (!reply) throw new Error("El modelo no devolvió el formato esperado");
  return { reply };
}

// Cadena de modelos gratuitos, de 3 proveedores distintos a propósito
// (si uno está caído o saturado, hay más probabilidad de que otro no lo
// esté). Se pasan como el parámetro nativo "models" de OpenRouter (no
// "model"), que activa SU fallback automático server-side: prueba cada
// uno en orden y salta al siguiente ante caídas, saturación (429),
// moderación o el modelo ya no existir — sin que tengamos que adivinar
// nosotros cuál sigue vivo. Esto es más fiable que mantener nuestra
// propia lista y reintentar a mano, porque OpenRouter conoce la
// disponibilidad real en cada instante.
//
// Los modelos gratuitos rotan con frecuencia (nos ha pasado ya dos veces:
// un modelo fue reasignado por un router aleatorio a un clasificador que
// no servía, y otro dejó de ofrecerse gratis de un día para otro). Si
// esta cadena entera falla, revisa openrouter.ai/models (filtro "Free")
// y actualízala. Cuando haya tráfico real de pago, sustituye esto por un
// modelo de pago fijo (ej. "anthropic/claude-haiku-4.5") para máxima
// fiabilidad — no hay forma de tener 100% de disponibilidad gratis.
const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

async function callOpenRouter(userPrompt: string, maxTokens: number) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      models: FREE_MODELS,
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

export async function generateResponses(
  businessType: string,
  reviewText: string
): Promise<GeneratedResponses> {
  const raw = await callOpenRouter(buildUserPrompt(businessType, reviewText), 1200);
  try {
    return parseTaggedResponses(raw);
  } catch (err) {
    console.error("No se pudo parsear la respuesta del modelo. Texto crudo:", raw.slice(0, 500));
    throw err;
  }
}

// Versión reducida para la demo pública (sin login): una sola respuesta,
// menos tokens. Comparte los mismos modelos gratuitos y, por tanto, el
// mismo límite diario de la cuenta — la demo cuenta contra esas 50/día.
export async function generateDemoResponse(
  businessType: string,
  reviewText: string
): Promise<string> {
  const raw = await callOpenRouter(buildDemoPrompt(businessType, reviewText), 300);
  try {
    return parseTaggedDemo(raw).reply;
  } catch (err) {
    console.error("No se pudo parsear la demo. Texto crudo:", raw.slice(0, 500));
    throw err;
  }
}
