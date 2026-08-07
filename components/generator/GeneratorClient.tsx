"use client";

import { useState } from "react";
import ResponseCard from "@/components/generator/ResponseCard";

const BUSINESS_TYPES = [
  "Restaurante",
  "Clínica dental",
  "Inmobiliaria",
  "Hotel",
  "Taller",
  "Peluquería",
  "Otro",
];

const TONE_ORDER = ["professional", "friendly", "premium", "seo_local", "negative"];

type Responses = Record<string, string> & { sentiment?: string };

export default function GeneratorClient({ defaultBusinessType }: { defaultBusinessType: string | null }) {
  const initialType =
    defaultBusinessType && BUSINESS_TYPES.includes(defaultBusinessType)
      ? defaultBusinessType
      : BUSINESS_TYPES[0];

  const [businessType, setBusinessType] = useState(initialType);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Responses | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (reviewText.trim().length < 3) return;

    setLoading(true);
    setError(null);
    setResponses(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, reviewText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error generando respuestas");
        return;
      }

      setResponses(data.responses);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">Generador de respuestas</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Pega la reseña de tu cliente y obtén 5 respuestas listas para copiar.
      </p>

      <form onSubmit={handleGenerate} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block font-body text-xs font-medium text-ink/50">
            Tipo de negocio
          </label>
          <select
            className="input-field"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-body text-xs font-medium text-ink/50">
            Reseña del cliente
          </label>
          <textarea
            required
            rows={5}
            minLength={3}
            maxLength={2000}
            placeholder="Pega aquí el texto de la reseña de Google..."
            className="input-field resize-none"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <p className="mt-1 text-right font-body text-xs text-ink/40">
            {reviewText.length}/2000
          </p>
        </div>

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Generando..." : "Generar respuestas"}
        </button>
      </form>

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink/5" />
          ))}
        </div>
      )}

      {responses && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TONE_ORDER.filter((key) => responses[key]).map((key) => (
            <ResponseCard key={key} toneKey={key} text={responses[key]} />
          ))}
        </div>
      )}
    </div>
  );
}
