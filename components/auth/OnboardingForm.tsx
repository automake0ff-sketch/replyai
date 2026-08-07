"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BUSINESS_TYPES = [
  "Restaurante",
  "Clínica dental",
  "Inmobiliaria",
  "Hotel",
  "Taller",
  "Peluquería",
  "Otro",
];

export default function OnboardingForm() {
  const router = useRouter();
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          brandVoiceNotes: "",
          defaultBusinessType: businessType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }

      router.push("/generator");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <span className="font-display text-xl italic">ReplyAI</span>
        <h1 className="mt-8 font-display text-3xl">Antes de empezar</h1>
        <p className="mt-2 font-body text-sm text-ink/60">
          Un par de datos rápidos para que las respuestas se adapten a tu negocio desde la primera vez — puedes cambiarlos luego en Ajustes.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              Nombre del negocio (opcional)
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="Ej: Restaurante La Terraza, Sevilla"
              className="input-field"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Guardando..." : "Empezar →"}
          </button>
        </form>

        <Link href="/generator" className="mt-4 block text-center font-body text-xs text-ink/40 hover:text-ink/60">
          Saltar por ahora
        </Link>
      </div>
    </main>
  );
}
