type SentimentCounts = { positive: number; negative: number; neutral: number };

export default function HistoryStats({
  total,
  sentimentCounts,
  topBusinessType,
}: {
  total: number;
  sentimentCounts: SentimentCounts;
  topBusinessType: string | null;
}) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Respuestas generadas
        </p>
        <p className="mt-2 font-display text-3xl">{total}</p>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card sm:col-span-2">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Sentimiento de las reseñas
        </p>
        {total === 0 ? (
          <p className="mt-3 font-body text-sm text-ink/40">Aún no hay datos.</p>
        ) : (
          <>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-ink/5">
              <div className="bg-moss" style={{ width: `${pct(sentimentCounts.positive)}%` }} />
              <div className="bg-ink/20" style={{ width: `${pct(sentimentCounts.neutral)}%` }} />
              <div className="bg-clay" style={{ width: `${pct(sentimentCounts.negative)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-body text-xs text-ink/60">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-moss" /> Positivas {pct(sentimentCounts.positive)}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink/20" /> Neutras {pct(sentimentCounts.neutral)}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-clay" /> Negativas {pct(sentimentCounts.negative)}%
              </span>
              {topBusinessType && (
                <span className="ml-auto text-ink/40">Tipo más frecuente: {topBusinessType}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
