import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendMonthlyReport } from "@/lib/email";

// Vercel Cron llama a esta ruta (ver vercel.json), protegida con el
// mismo CRON_SECRET que el reset de créditos. Solo se manda el informe
// a usuarios que generaron al menos 1 respuesta en los últimos 30 días
// — no tiene sentido (ni es buena práctica) mandar un email vacío a
// quien no usó el producto ese mes.
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurado" }, { status: 500 });
  }

  const supabase = createServiceClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, business_name");

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const profile of profiles || []) {
    const { data: generations } = await supabase
      .from("generations")
      .select("review_sentiment")
      .eq("user_id", profile.id)
      .gte("created_at", thirtyDaysAgo);

    if (!generations || generations.length === 0) continue; // usuario inactivo ese mes, no se le manda nada

    const counts = { positive: 0, negative: 0, neutral: 0 };
    for (const g of generations) {
      const s = (g.review_sentiment as "positive" | "negative" | "neutral" | null) || "neutral";
      if (s === "positive" || s === "negative" || s === "neutral") counts[s]++;
    }

    try {
      await sendMonthlyReport(profile.email, {
        total: generations.length,
        ...counts,
        businessName: profile.business_name,
      });
      sent++;
    } catch (err) {
      console.error(`Error enviando informe a ${profile.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
