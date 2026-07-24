"use client";

import { useState } from "react";
import Link from "next/link";

const BUSINESS_TYPES_ES = [
  "Restaurante",
  "Clínica dental",
  "Inmobiliaria",
  "Hotel",
  "Taller",
  "Peluquería",
];

const BUSINESS_TYPES_EN = [
  "Restaurant",
  "Dental clinic",
  "Real estate agency",
  "Hotel",
  "Auto shop",
  "Hair salon",
];

const COPY = {
  es: {
    label: "Tipo de negocio",
    placeholder: "Pega aquí una reseña real (o inventada) para probar...",
    button: "Generar respuesta gratis",
    loading: "Generando...",
    cta: "Regístrate gratis para ver las 5 versiones y guardar tu historial",
    signup: "Prueba gratis",
  },
  en: {
    label: "Business type",
    placeholder: "Paste a real (or made-up) review to try it out...",
    button: "Generate a free reply",
    loading: "Generating...",
    cta: "Sign up free to see all 5 tones and save your history",
    signup: "Try it free",
  },
};

export default function LandingDemo({ locale = "es" }: { locale?: "es" | "en" }) {
  const types = locale === "en" ? BUSINESS_TYPES_EN : BUSINESS_TYPES_ES;
  const t = COPY[locale];

  const [businessType, setBusinessType] = useState(types[0]);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reviewText.trim().length < 3) return;

    setLoading(true);
    setError(null);
    setReply(null);

    try {
      const res = await fetch("/api/demo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, reviewText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error generando la respuesta");
        return;
      }

      setReply(data.reply);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-body text-xs font-medium text-ink/50">
            {t.label}
          </label>
          <select
            className="input-field"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <textarea
          required
          rows={4}
          minLength={3}
          maxLength={1000}
          placeholder={t.placeholder}
          className="input-field resize-none"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? t.loading : t.button}
        </button>
      </form>

      {loading && (
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-ink/5" />
      )}

      {reply && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-paper p-5">
          <p className="font-body text-sm leading-relaxed text-ink/80">{reply}</p>
          <Link
            href="/signup"
            className="mt-4 inline-block font-body text-sm font-semibold text-clay underline"
          >
            {t.cta} →
          </Link>
        </div>
      )}
    </div>
  );
}
