"use client";

import { useState } from "react";

const TONE_LABELS: Record<string, { label: string; color: string }> = {
  professional: { label: "Profesional", color: "bg-blue-50 text-blue-700" },
  friendly: { label: "Cercana", color: "bg-moss/10 text-moss" },
  premium: { label: "Premium", color: "bg-purple-50 text-purple-700" },
  seo_local: { label: "SEO Local", color: "bg-amber-50 text-amber-700" },
  negative: { label: "Reseña negativa", color: "bg-red-50 text-red-700" },
};

export default function ResponseCard({
  toneKey,
  text,
}: {
  toneKey: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);
  const tone = TONE_LABELS[toneKey] ?? { label: toneKey, color: "bg-ink/5 text-ink" };

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${tone.color}`}>
          {tone.label}
        </span>
        <button
          onClick={handleCopy}
          className="font-body text-xs font-medium text-ink/50 hover:text-ink"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <p className="mt-4 font-body text-sm leading-relaxed text-ink/80">{text}</p>
    </div>
  );
}
