import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResponses } from "@/lib/openrouter";
import { isSameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let businessType: unknown, reviewText: unknown;
  try {
    ({ businessType, reviewText } = await req.json());
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  if (
    typeof businessType !== "string" ||
    typeof reviewText !== "string" ||
    !businessType.trim() ||
    reviewText.trim().length < 3
  ) {
    return NextResponse.json(
      { error: "Faltan datos: tipo de negocio y texto de la reseña" },
      { status: 400 }
    );
  }

  if (businessType.length > 100) {
    return NextResponse.json(
      { error: "Tipo de negocio demasiado largo" },
      { status: 400 }
    );
  }

  if (reviewText.length > 2000) {
    return NextResponse.json(
      { error: "La reseña es demasiado larga (máximo 2000 caracteres)" },
      { status: 400 }
    );
  }

  // Rate limit básico: máximo 8 generaciones por minuto por usuario.
  // Evita que un botón atascado o un script abusivo dispare peticiones
  // sin control (y sin límite, cada una cuesta dinero en OpenRouter).
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo);

  if ((recentCount ?? 0) >= 8) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
      { status: 429 }
    );
  }

  // Comprobación previa (solo lectura): evita pagar una llamada a la IA
  // si el usuario ya no tiene créditos. Aprovechamos la misma consulta
  // para traer el nombre del negocio guardado en el perfil (configurado
  // en Ajustes) y que la IA lo use de forma natural, sobre todo en el
  // tono SEO local.
  const { data: precheck } = await supabase
    .from("profiles")
    .select("plan, credits_remaining, business_name, brand_voice_notes")
    .eq("id", user.id)
    .single();

  const isUnlimited = precheck?.plan === "pro" || precheck?.plan === "agency";

  if (!isUnlimited && (precheck?.credits_remaining ?? 0) <= 0) {
    return NextResponse.json(
      { error: "Sin créditos disponibles. Actualiza tu plan para continuar." },
      { status: 402 }
    );
  }

  // Genera: si el modelo falla, el usuario no pierde un crédito por nada.
  let responses;
  try {
    responses = await generateResponses(
      businessType,
      reviewText,
      precheck?.business_name || undefined,
      precheck?.brand_voice_notes || undefined
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error generando respuestas" },
      { status: 500 }
    );
  }

  // Descuento atómico de crédito. Protege contra condiciones de carrera
  // entre el precheck y este punto (doble clic rápido, dos pestañas).
  const { error: creditError } = await supabase.rpc("consume_credit", {
    p_user_id: user.id,
  });

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("generations").insert({
    user_id: user.id,
    business_type: businessType,
    review_text: reviewText,
    review_sentiment: responses.sentiment,
    responses,
  });

  if (insertError) {
    // No bloqueamos la respuesta al usuario por un fallo de logging,
    // pero sí queremos verlo en los logs de Vercel para depurarlo.
    console.error("Error guardando generación:", insertError.message);
  }

  return NextResponse.json({ responses });
}
