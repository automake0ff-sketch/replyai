"use client";

import { useState } from "react";

export function UpgradeButton({ plan, label }: { plan: "pro" | "agency"; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "No se pudo iniciar el pago");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleUpgrade} disabled={loading} className="btn-primary">
        {loading ? "Cargando..." : label}
      </button>
      {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "No se pudo abrir el portal de facturación");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className="btn-secondary">
        {loading ? "Cargando..." : "Gestionar facturación"}
      </button>
      {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
    </div>
  );
}
