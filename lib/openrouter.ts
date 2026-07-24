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
      // en vez de error cuando reciben un parámetro que no manejan. Por eso
      // el formato de salida se pide como etiquetas [TAG]...[/TAG] en el
      // prompt (ver parseTaggedResponses/parseTaggedDemo más abajo), mucho
      // más tolerante que JSON para modelos gratuitos débiles.
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

// Modelo fijo para el generador real (usuarios registrados). El router
// gratuito "openrouter/free" puede asignar CUALQUIER modelo etiquetado
// como chat, incluidos clasificadores/filtros de moderación que no sirven
// para generar texto (ej. nvidia/nemotron-3.5-content-safety). Para una
// función central del producto de pago, eso es demasiado inestable —
// se usa un modelo fijo y barato en su lugar. Requiere saldo real en
// OpenRouter (unos 5-10€ dan para miles de generaciones).
const PRIMARY_MODEL = "anthropic/claude-haiku-4.5";

export async function generateResponses(
  businessType: string,
  reviewText: string
): Promise<GeneratedResponses> {
  const raw = await callOpenRouter(buildUserPrompt(businessType, reviewText), 1200, PRIMARY_MODEL);
  try {
    return parseTaggedResponses(raw);
  } catch (err) {
    console.error("No se pudo parsear la respuesta del modelo. Texto crudo:", raw.slice(0, 500));
    throw err;
  }
}

// Versión reducida para la demo pública (sin login): una sola respuesta,
// menos tokens. Sí usa el router gratuito: es tráfico anónimo de la
// landing, sin coste, y un fallo ocasional aquí no afecta al producto
// de pago — el usuario solo pierde una prueba gratuita, no dinero.
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
