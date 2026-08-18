import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleAuthUrl, isGbpConfigured } from "@/lib/google-business";

// Inicia el flujo OAuth con Google Business Profile. Solo Pro/Agencia,
// y solo si hay credenciales configuradas (mientras Google no apruebe
// el acceso a la API, esto no está activo en producción).
export async function GET(req: NextRequest) {
  if (!isGbpConfigured()) {
    return NextResponse.redirect(
      new URL("/settings?gbp_error=not_configured", req.nextUrl.origin)
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (profile?.plan !== "pro" && profile?.plan !== "agency") {
    return NextResponse.redirect(new URL("/settings?gbp_error=requires_pro", req.nextUrl.origin));
  }

  // state protege el callback frente a CSRF en el propio flujo OAuth
  // (además de la comprobación same-origin que ya cubre el resto de la
  // app — ver lib/security.ts). Va en una cookie httpOnly de corta vida,
  // y el callback exige que coincida con lo que devuelve Google.
  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set("gbp_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
