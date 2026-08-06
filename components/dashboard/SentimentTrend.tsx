type WeekBucket = { label: string; positive: number; negative: number; neutral: number; total: number };

export default function SentimentTrend({ buckets }: { buckets: WeekBucket[] }) {
  const hasData = buckets.some((b) => b.total > 0);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
      <p className="font-body text-xs uppercase tracking-wide text-ink/40">
        Evolución del sentimiento de tus reseñas
      </p>
      <p className="mt-1 font-body text-xs text-ink/40">
        De las reseñas que has gestionado con ReplyAI — no es tu nota media de Google, que no tenemos forma de medir todavía.
      </p>

      {!hasData ? (
        <p className="mt-6 font-body text-sm text-ink/40">
          Genera algunas respuestas para empezar a ver la tendencia aquí.
        </p>
      ) : (
        <div className="mt-6 flex items-end gap-2" style={{ height: 120 }}>
          {buckets.map((b) => {
            const pct = b.total > 0 ? (b.positive / b.total) * 100 : 0;
            return (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-ink/5">
                  <div
                    className="w-full bg-moss transition-all"
                    style={{ height: b.total > 0 ? `${Math.max(pct, 4)}%` : "0%" }}
                    title={`${Math.round(pct)}% positivas de ${b.total}`}
                  />
                </div>
                <span className="font-body text-[10px] text-ink/40">{b.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
