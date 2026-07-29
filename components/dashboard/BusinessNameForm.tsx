"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/profile/update-business-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name }),
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
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-3">
      <input
        type="text"
        maxLength={200}
        placeholder="Ej: Restaurante La Terraza, Sevilla"
        className="input-field"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={loading} className="btn-secondary whitespace-nowrap">
        {loading ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
      </button>
      {error && <p className="font-body text-sm text-red-600">{error}</p>}
    </form>
  );
}
