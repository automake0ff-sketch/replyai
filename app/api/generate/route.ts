import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResponses } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { businessType, reviewText } = await req.json();

  if (!businessType || !reviewText || reviewText.trim().length < 3) {
    return NextResponse.json(
      { error: "Faltan datos: tipo de negocio y texto de la reseña" },
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
  // si el usuario ya no tiene créditos.
  const { data: precheck } = await supabase
    .from("profiles")
    .select("plan, credits_remaining")
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
    responses = await generateResponses(businessType, reviewText);
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

  await supabase.from("generations").insert({
    user_id: user.id,
    business_type: businessType,
    review_text: reviewText,
    review_sentiment: responses.sentiment,
    responses,
  });

  return NextResponse.json({ responses });
}
