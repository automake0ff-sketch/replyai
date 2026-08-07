import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirige aquí tras completar el login con Google, con un
// "code" en la URL que hay que intercambiar por una sesión real.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const supabase = createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // El mismo callback sirve para login y para registro con Google — no
  // hay forma directa de distinguirlos aquí. En vez de eso, comprobamos
  // si el perfil ya tiene tipo de negocio configurado: si no lo tiene
  // (cuenta recién creada, o alguien que saltó el onboarding antes), lo
  // mandamos a completarlo; si ya lo tiene, sigue directo al dashboard.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_business_type")
      .eq("id", user.id)
      .single();

    if (!profile?.default_business_type) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}
