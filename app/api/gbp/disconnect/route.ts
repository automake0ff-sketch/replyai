import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revokeToken } from "@/lib/google-business";
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

  const service = createServiceClient();
  const { data: connection } = await service
    .from("gbp_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (connection?.access_token) {
    // Revocar en Google primero: si esto falla, preferimos dejar el
    // registro y que el usuario reintente, a perder el rastro de un
    // token que sigue activo en su cuenta de Google.
    await revokeToken(connection.access_token).catch((err) =>
      console.error("No se pudo revocar el token en Google (se borra igualmente):", err)
    );
  }

  await supabase.rpc("disconnect_gbp");

  return NextResponse.json({ ok: true });
}
