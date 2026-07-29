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

  let businessName: unknown;
  try {
    ({ businessName } = await req.json());
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  if (typeof businessName !== "string" || businessName.length > 200) {
    return NextResponse.json({ error: "Nombre de negocio inválido" }, { status: 400 });
  }

  // Llama a la función SECURITY DEFINER: solo puede tocar la fila del
  // propio usuario (auth.uid() dentro de la función), y solo la columna
  // business_name — nunca plan/créditos.
  const { error } = await supabase.rpc("update_own_business_name", {
    p_business_name: businessName,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
