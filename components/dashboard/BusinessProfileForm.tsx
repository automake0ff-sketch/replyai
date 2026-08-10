"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  "Restaurante",
  "Clínica dental",
  "Inmobiliaria",
  "Hotel",
  "Taller",
  "Peluquería",
  "Otro",
];

export default function BusinessProfileForm({
  initialName,
  initialBrandVoice,
  initialDefaultType,
  isPro,
}: {
  initialName: string;
  initialBrandVoice: string;
  initialDefaultType: string;
  isPro: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice);
  const [defaultType, setDefaultType] = useState(initialDefaultType || BUSINESS_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: name,
          brandVoiceNotes: isPro ? brandVoice : "",
          defaultBusinessType: defaultType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-3">
      <div>
        <label className="mb-1 block font-body text-xs font-medium text-ink/50">
          Tipo de negocio por defecto
        </label>
        <select
          className="input-field"
          value={defaultType}
          onChange={(e) => setDefaultType(e.target.value)}
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p className="mt-1 font-body text-xs text-ink/40">
          Se preselecciona en el generador, para no elegirlo cada vez — sigues pudiendo cambiarlo puntualmente ahí.
        </p>
      </div>

      <div>
        <label className="mb-1 block font-body text-xs font-medium text-ink/50">
          Nombre del negocio
        </label>
        <input
          type="text"
          maxLength={200}
          placeholder="Ej: Restaurante La Terraza, Sevilla"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block font-body text-xs font-medium text-ink/50">
          Voz de marca {!isPro && <span className="text-clay">— Pro</span>}
        </label>
        <textarea
          rows={3}
          maxLength={500}
          disabled={!isPro}
          placeholder={isPro ? "Ej: firma siempre como 'Ana', nunca menciones descuentos, tono desenfadado y cercano" : "Disponible en el plan Pro"}
          className="input-field resize-none disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/40"
          value={isPro ? brandVoice : ""}
          onChange={(e) => setBrandVoice(e.target.value)}
        />
        {isPro && <p className="mt-1 text-right font-body text-xs text-ink/40">{brandVoice.length}/500</p>}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
        </button>
        {error && <p className="font-body text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
