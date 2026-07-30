import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateDemoResponse } from "@/lib/openrouter";

// Esta ruta la llama la extensión de Chrome desde otro origen
// (chrome-extension://...), así que NO puede depender de la cookie de
// sesión del navegador — usa un token Bearer personal generado en
// Ajustes (ver /api/tokens). Por eso permite CORS amplio: el propio
// token es la credencial explícita que hay que adjuntar a mano, no una
// cookie ambiental que el navegador mande solo — el riesgo de CSRF que
// justifica el chequeo de Origin en las demás rutas no aplica aquí.

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const MAX_PER_MINUTE = 8;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return NextResponse.json(
      { error: "Falta el token de autenticación" },
      { status: 401, headers: corsHeaders() }
    );
  }

  const supabase = createServiceClient();

  const { data: userId, error: tokenError } = await supabase.rpc("get_user_id_for_token", {
    p_token: token,
  });

  if (tokenError || !userId) {
    return NextResponse.json(
      { error: "Token inválido o revocado" },
      { status: 401, headers: corsHeaders() }
    );
  }

  let businessType: unknown, reviewText: unknown;
  try {
    ({ businessType, reviewText } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido" },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (
    typeof businessType !== "string" ||
    typeof reviewText !== "string" ||
    !businessType.trim() ||
    reviewText.trim().length < 3
  ) {
    return NextResponse.json(
      { error: "Faltan datos: tipo de negocio y texto de la reseña" },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (businessType.length > 100 || reviewText.length > 2000) {
    return NextResponse.json(
      { error: "Texto demasiado largo" },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Rate limit básico por usuario (igual que en el generador del dashboard).
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneMinuteAgo);

  if ((recentCount ?? 0) >= MAX_PER_MINUTE) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento." },
      { status: 429, headers: corsHeaders() }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, credits_remaining, business_name")
    .eq("id", userId)
    .single();

  const isUnlimited = profile?.plan === "pro" || profile?.plan === "agency";

  if (!isUnlimited && (profile?.credits_remaining ?? 0) <= 0) {
    return NextResponse.json(
      { error: "Sin créditos disponibles. Actualiza tu plan en ReplyAI." },
      { status: 402, headers: corsHeaders() }
    );
  }

  // La extensión pide UNA respuesta lista para pegar (no las 5 del
  // dashboard) — no hay sitio en la interfaz de Google para elegir tono.
  let reply: string;
  try {
    reply = await generateDemoResponse(businessType, reviewText, profile?.business_name || undefined);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error generando la respuesta" },
      { status: 500, headers: corsHeaders() }
    );
  }

  const { error: creditError } = await supabase.rpc("consume_credit", {
    p_user_id: userId,
  });

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: 500, headers: corsHeaders() });
  }

  await supabase.from("generations").insert({
    user_id: userId,
    business_type: businessType,
    review_text: reviewText,
    review_sentiment: null,
    responses: { professional: reply },
  });

  return NextResponse.json({ reply }, { headers: corsHeaders() });
}
