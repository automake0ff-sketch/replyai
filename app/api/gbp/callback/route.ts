import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, fetchFirstAccountAndLocation } from "@/lib/google-business";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("gbp_oauth_state")?.value;
  const settingsUrl = new URL("/herramientas", req.nextUrl.origin);

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("gbp_error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Pasa si el usuario ya había autorizado antes y Google no reemite
      // refresh_token pese al prompt=consent (raro, pero posible). Sin
      // refresh_token no podemos mantener la conexión viva a largo plazo.
      throw new Error("Google no devolvió refresh_token. Revoca el acceso en myaccount.google.com/permissions y vuelve a intentarlo.");
    }

    const { accountId, locationId, locationName } = await fetchFirstAccountAndLocation(
      tokens.access_token
    );

    const service = createServiceClient();
    const { error } = await service.from("gbp_connections").upsert(
      {
        user_id: user.id,
        google_account_id: accountId,
        google_location_id: locationId,
        google_location_name: locationName,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;

    settingsUrl.searchParams.set("gbp_connected", "1");
  } catch (err) {
    console.error("Error conectando Google Business Profile:", err);
    settingsUrl.searchParams.set("gbp_error", "connection_failed");
  }

  const response = NextResponse.redirect(settingsUrl);
  response.cookies.delete("gbp_oauth_state");
  return response;
}
