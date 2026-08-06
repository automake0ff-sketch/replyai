"use client";

import { useState } from "react";

const TONES = [
  { value: "", label: "Elegir manualmente cada vez (por defecto)" },
  { value: "professional", label: "Profesional" },
  { value: "friendly", label: "Cercano" },
  { value: "premium", label: "Premium" },
  { value: "seo_local", label: "SEO Local" },
];

export default function AutoToneSelector({ initialTone }: { initialTone: string }) {
  const [tone, setTone] = useState(initialTone);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(newTone: string) {
    setTone(newTone);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/update-extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoTonePositive: newTone || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <select
        className="input-field"
        value={tone}
        onChange={(e) => handleSave(e.target.value)}
        disabled={loading}
      >
        {TONES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {saved && <p className="mt-1 font-body text-xs text-moss">Guardado ✓</p>}
      {error && <p className="mt-1 font-body text-xs text-red-600">{error}</p>}
    </div>
  );
}
