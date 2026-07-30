"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessProfileForm({
  initialName,
  initialBrandVoice,
}: {
  initialName: string;
  initialBrandVoice: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice);
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
        body: JSON.stringify({ businessName: name, brandVoiceNotes: brandVoice }),
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
          Voz de marca (opcional)
        </label>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="Ej: firma siempre como 'Ana', nunca menciones descuentos, tono desenfadado y cercano"
          className="input-field resize-none"
          value={brandVoice}
          onChange={(e) => setBrandVoice(e.target.value)}
        />
        <p className="mt-1 text-right font-body text-xs text-ink/40">{brandVoice.length}/500</p>
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
