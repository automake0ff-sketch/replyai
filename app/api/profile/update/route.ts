import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  const businessName = body.businessName;
  const brandVoiceNotes = body.brandVoiceNotes;

  if (typeof businessName !== "string" || businessName.length > 200) {
    return NextResponse.json({ error: "Nombre de negocio inválido" }, { status: 400 });
  }

  if (typeof brandVoiceNotes !== "string" || brandVoiceNotes.length > 500) {
    return NextResponse.json({ error: "Instrucciones de marca inválidas (máx. 500 caracteres)" }, { status: 400 });
  }

  // Voz de marca: función Pro/Agencia. En Free se puede dejar vacía
  // (para no romper si ya no la usan) pero no se puede establecer un
  // valor nuevo.
  if (brandVoiceNotes.trim().length > 0) {
    const { data: planCheck } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (planCheck?.plan !== "pro" && planCheck?.plan !== "agency") {
      return NextResponse.json(
        { error: "La voz de marca es una función de los planes Pro y Agencia." },
        { status: 403 }
      );
    }
  }

  // defaultBusinessType es opcional en el body: si no viene (ej. desde
  // el formulario de Ajustes, que no lo edita), se preserva el valor
  // actual en vez de borrarlo.
  let defaultBusinessType: string | null;
  if ("defaultBusinessType" in body) {
    if (typeof body.defaultBusinessType !== "string" || body.defaultBusinessType.length > 100) {
      return NextResponse.json({ error: "Tipo de negocio inválido" }, { status: 400 });
    }
    defaultBusinessType = body.defaultBusinessType;
  } else {
    const { data: current } = await supabase
      .from("profiles")
      .select("default_business_type")
      .eq("id", user.id)
      .single();
    defaultBusinessType = current?.default_business_type ?? "";
  }

  // Función SECURITY DEFINER: solo toca la fila del propio usuario
  // (auth.uid() dentro de la función), y solo estas columnas —
  // nunca plan/créditos.
  const { error } = await supabase.rpc("update_own_business_profile", {
    p_business_name: businessName,
    p_brand_voice_notes: brandVoiceNotes,
    p_default_business_type: defaultBusinessType,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
