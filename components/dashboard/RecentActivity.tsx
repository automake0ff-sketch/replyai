import Link from "next/link";

type Generation = {
  id: string;
  business_type: string;
  review_text: string;
  review_sentiment: string | null;
  created_at: string;
};

const SENTIMENT_BADGE: Record<string, { label: string; color: string }> = {
  positive: { label: "Positiva", color: "bg-moss/10 text-moss" },
  negative: { label: "Negativa", color: "bg-clay/10 text-clay" },
  neutral: { label: "Neutra", color: "bg-ink/8 text-ink/60" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function RecentActivity({ generations }: { generations: Generation[] }) {
  if (generations.length === 0) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">Actividad reciente</p>
        <p className="mt-3 font-body text-sm text-ink/40">
          Aún no has generado ninguna respuesta este mes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">Actividad reciente</p>
        <Link href="/history" className="font-body text-xs font-medium text-clay hover:underline">
          Ver todo →
        </Link>
      </div>
      <div className="mt-3 divide-y divide-ink/8">
        {generations.map((g) => {
          const badge = SENTIMENT_BADGE[g.review_sentiment || "neutral"];
          return (
            <div key={g.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${badge.color}`}>
                {badge.label}
              </span>
              <span className="shrink-0 font-body text-xs text-ink/40">{g.business_type}</span>
              <span className="flex-1 truncate font-body text-sm text-ink/70">{g.review_text}</span>
              <span className="shrink-0 font-body text-xs text-ink/40">{formatDate(g.created_at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
