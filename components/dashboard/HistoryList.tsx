"use client";

import { useMemo, useState } from "react";
import ResponseCard from "@/components/generator/ResponseCard";

type Generation = {
  id: string;
  business_type: string;
  review_text: string;
  review_sentiment: string | null;
  responses: Record<string, string>;
  created_at: string;
};

const SENTIMENT_BADGE: Record<string, { label: string; color: string }> = {
  positive: { label: "Positiva", color: "bg-moss/10 text-moss" },
  negative: { label: "Negativa", color: "bg-clay/10 text-clay" },
  neutral: { label: "Neutra", color: "bg-ink/8 text-ink/60" },
};

const TONE_ORDER = ["professional", "friendly", "premium", "seo_local", "negative"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryList({ generations }: { generations: Generation[] }) {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const businessTypes = useMemo(
    () => Array.from(new Set(generations.map((g) => g.business_type))).sort(),
    [generations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return generations.filter((g) => {
      if (sentimentFilter !== "all" && g.review_sentiment !== sentimentFilter) return false;
      if (typeFilter !== "all" && g.business_type !== typeFilter) return false;
      if (q && !g.review_text.toLowerCase().includes(q) && !g.business_type.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [generations, search, sentimentFilter, typeFilter]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar en las reseñas..."
          className="input-field flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field w-auto"
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
        >
          <option value="all">Todos los sentimientos</option>
          <option value="positive">Positivas</option>
          <option value="neutral">Neutras</option>
          <option value="negative">Negativas</option>
        </select>
        <select
          className="input-field w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Todos los negocios</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 font-body text-sm text-ink/40">
          {generations.length === 0
            ? "Aún no has generado ninguna respuesta."
            : "Ninguna reseña coincide con el filtro."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((g) => {
            const badge = SENTIMENT_BADGE[g.review_sentiment || "neutral"];
            const isExpanded = expandedId === g.id;
            return (
              <div key={g.id} className="rounded-2xl border border-ink/10 bg-white shadow-card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : g.id)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left"
                >
                  <span className={`shrink-0 rounded-full px-3 py-1 font-body text-xs font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="shrink-0 font-body text-xs text-ink/40">{g.business_type}</span>
                  <span className="flex-1 truncate font-body text-sm text-ink/70">{g.review_text}</span>
                  <span className="shrink-0 font-body text-xs text-ink/40">{formatDate(g.created_at)}</span>
                </button>

                {isExpanded && (
                  <div className="border-t border-ink/8 px-6 py-5">
                    <p className="font-body text-sm italic text-ink/60">"{g.review_text}"</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {TONE_ORDER.filter((key) => g.responses[key]).map((key) => (
                        <ResponseCard key={key} toneKey={key} text={g.responses[key]} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
