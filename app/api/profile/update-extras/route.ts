import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/security";

const VALID_TONES = ["professional", "friendly", "premium", "seo_local"];

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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  // Ambos campos son opcionales: la ruta se usa tanto desde el selector
  // de tono como desde el formulario de enlace, por separado. Se leen
  // los valores actuales para no pisar el campo que no se está editando.
  const { data: current } = await supabase
    .from("profiles")
    .select("auto_tone_positive, review_link")
    .eq("id", user.id)
    .single();

  const autoTonePositive =
    "autoTonePositive" in body ? body.autoTonePositive : current?.auto_tone_positive ?? null;
  const reviewLink = "reviewLink" in body ? body.reviewLink : current?.review_link ?? "";

  if (autoTonePositive !== null && !VALID_TONES.includes(autoTonePositive)) {
    return NextResponse.json({ error: "Tono no válido" }, { status: 400 });
  }

  if (typeof reviewLink !== "string" || reviewLink.length > 500) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 400 });
  }

  const { error } = await supabase.rpc("update_own_extras", {
    p_auto_tone_positive: autoTonePositive,
    p_review_link: reviewLink,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
