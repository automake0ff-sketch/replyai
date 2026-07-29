import { createClient } from "@/lib/supabase/server";
import HistoryStats from "@/components/dashboard/HistoryStats";
import HistoryList from "@/components/dashboard/HistoryList";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: generations } = await supabase
    .from("generations")
    .select("id, business_type, review_text, review_sentiment, responses, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const list = generations || [];

  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  const typeCounts: Record<string, number> = {};

  for (const g of list) {
    const s = (g.review_sentiment as "positive" | "negative" | "neutral" | null) || "neutral";
    if (s === "positive" || s === "negative" || s === "neutral") sentimentCounts[s]++;
    typeCounts[g.business_type] = (typeCounts[g.business_type] || 0) + 1;
  }

  const topBusinessType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div>
      <h1 className="font-display text-3xl">Historial</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Todas tus respuestas generadas, con búsqueda y estadísticas básicas.
      </p>

      <div className="mt-8">
        <HistoryStats
          total={list.length}
          sentimentCounts={sentimentCounts}
          topBusinessType={topBusinessType}
        />
      </div>

      <HistoryList generations={list as any} />
    </div>
  );
}
