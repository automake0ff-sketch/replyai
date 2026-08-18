"use client";

import { useState } from "react";

export default function GoogleBusinessProfileCard({
  connected: initialConnected,
  locationName: initialLocationName,
}: {
  connected: boolean;
  locationName: string | null;
}) {
  const [connected, setConnected] = useState(initialConnected);
  const [locationName, setLocationName] = useState(initialLocationName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gbp/disconnect", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo desconectar");
        return;
      }
      setConnected(false);
      setLocationName(null);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (connected) {
    return (
      <div className="mt-2">
        <p className="font-body text-sm text-ink/70">
          Conectado a <span className="font-semibold">{locationName || "tu ubicación de Google"}</span>.
        </p>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="mt-2 font-body text-sm text-red-600 hover:underline"
        >
          {loading ? "Desconectando..." : "Desconectar"}
        </button>
        {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a href="/api/gbp/connect" className="btn-secondary inline-block">
        Conectar Google Business Profile
      </a>
    </div>
  );
}
