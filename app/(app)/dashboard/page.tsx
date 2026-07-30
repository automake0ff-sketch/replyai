import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import HistoryStats from "@/components/dashboard/HistoryStats";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, credits_remaining, credits_limit")
    .eq("id", user!.id)
    .single();

  const { count: generationsCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  // Últimos 30 días: para la analítica y la actividad reciente. Un
  // vistazo del mes en curso, no todo el histórico acumulado (eso ya
  // vive en /history).
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentGenerations } = await supabase
    .from("generations")
    .select("id, business_type, review_text, review_sentiment, created_at")
    .eq("user_id", user!.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false })
    .limit(30);

  const list = recentGenerations || [];
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  const typeCounts: Record<string, number> = {};

  for (const g of list) {
    const s = (g.review_sentiment as "positive" | "negative" | "neutral" | null) || "neutral";
    if (s === "positive" || s === "negative" || s === "neutral") sentimentCounts[s]++;
    typeCounts[g.business_type] = (typeCounts[g.business_type] || 0) + 1;
  }

  const topBusinessType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const plan = profile?.plan ?? "free";
  const isUnlimited = plan === "pro" || plan === "agency";

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Bienvenido de nuevo.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Créditos disponibles
          </p>
          <p className="mt-2 font-display text-3xl">
            {isUnlimited ? "∞" : profile?.credits_remaining ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Respuestas generadas
          </p>
          <p className="mt-2 font-display text-3xl">{generationsCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Plan actual
          </p>
          <p className="mt-2 font-display text-3xl capitalize">{plan}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 font-body text-xs uppercase tracking-wide text-ink/40">
          Últimos 30 días
        </p>
        <HistoryStats total={list.length} sentimentCounts={sentimentCounts} topBusinessType={topBusinessType} />
      </div>

      <div className="mt-6">
        <RecentActivity generations={list.slice(0, 5)} />
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/generator" className="btn-primary inline-flex">
          Generar respuestas →
        </Link>
        <Link href="/history" className="btn-secondary inline-flex">
          Ver historial
        </Link>
      </div>
    </div>
  );
}
