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

  let sentiment: GeneratedResponses["sentiment"];
  if (sentimentRaw === "negative" || sentimentRaw === "neutral" || sentimentRaw === "positive") {
    sentiment = sentimentRaw;
  } else {
    // Si el modelo no devuelve un valor reconocible, NO asumimos "positive"
    // por defecto — sería un dato de analítica engañoso (una reseña que sí
    // era negativa quedaría etiquetada como positiva). "neutral" es el
    // valor honesto para "no se pudo determinar". Esto solo afecta al
    // campo guardado en `review_sentiment`, no a si se muestra el tono de
    // reseña negativa: eso depende únicamente de si el modelo incluyó el
    // bloque [NEGATIVE], de forma independiente a este campo.
    console.error("Sentimiento no reconocido en la respuesta del modelo:", sentimentRaw);
    sentiment = "neutral";
  }

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

// En vez de mantener nosotros una lista fija de nombres de modelo (que
// hemos visto quedar desactualizada en horas: modelos retirados sin
// aviso, renombrados, o reasignados a clasificadores que no sirven para
// generar texto), consultamos el catálogo público y en vivo de
// OpenRouter en cada petición, filtrando solo los que son gratuitos y
// parecen aptos para generación de texto. Se cachea unos minutos en
// memoria del proceso para no duplicar la consulta en ráfagas de tráfico.
let modelListCache: { list: string[]; fetchedAt: number } | null = null;
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

// Palabras que descartan un modelo por no ser de generación de texto de
// propósito general (clasificadores, filtros de moderación, embeddings...).
const BLOCKED_KEYWORDS = ["safety", "guard", "moderation", "classifier", "toxic", "embed"];

// Última línea de defensa si la consulta al catálogo en vivo falla por
// completo (ej. OpenRouter caído). Puede estar desactualizada, es un
// mejor esfuerzo, no una garantía.
const STATIC_FALLBACK_MODELS = ["google/gemma-4-31b-it:free"];

async function getFreeModels(): Promise<string[]> {
  if (modelListCache && Date.now() - modelListCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    return modelListCache.list;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) throw new Error(`No se pudo consultar el catálogo (${res.status})`);

    const data = await res.json();
    const models: any[] = data.data || [];

    const list = models
      .filter((m) => typeof m.id === "string" && m.id.endsWith(":free"))
      .filter((m) => {
        const haystack = `${m.id} ${m.name || ""}`.toLowerCase();
        return !BLOCKED_KEYWORDS.some((kw) => haystack.includes(kw));
      })
      .filter((m) => (m.context_length ?? 0) >= 4000)
      .map((m) => m.id as string)
      .slice(0, 6);

    if (list.length === 0) throw new Error("El catálogo no devolvió modelos gratuitos válidos");

    modelListCache = { list, fetchedAt: Date.now() };
    return list;
  } catch (err) {
    console.error("Fallo consultando el catálogo de OpenRouter, usando lista de respaldo:", err);
    return STATIC_FALLBACK_MODELS;
  }
}

async function callSingleModel(userPrompt: string, maxTokens: number, model: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
    throw new Error(`OpenRouter error (${res.status}) con ${model}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;

  if (!raw) {
    console.error(
      "OpenRouter devolvió contenido vacío. modelo:",
      model,
      "finish_reason:",
      finishReason,
      "respuesta completa:",
      JSON.stringify(data)
    );
    throw new Error(`El modelo ${model} no devolvió contenido (motivo: ${finishReason || "desconocido"})`);
  }

  return raw as string;
}

async function callOpenRouter(userPrompt: string, maxTokens: number) {
  const models = await getFreeModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      return await callSingleModel(userPrompt, maxTokens, model);
    } catch (err) {
      console.error(`Fallo con ${model}, probando siguiente modelo de la cadena:`, err);
      lastError = err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Todos los modelos gratuitos disponibles fallaron. Inténtalo de nuevo en unos minutos.");
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
