"use client";

import { useState } from "react";

export default function ExtensionTokenPanel({ hasToken }: { hasToken: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExists, setTokenExists] = useState(hasToken);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo generar el token");
        return;
      }
      setToken(data.token);
      setTokenExists(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se pudo revocar el token");
        return;
      }
      setToken(null);
      setTokenExists(false);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-2">
      {token ? (
        <div className="rounded-xl border border-clay/30 bg-clay/5 p-4">
          <p className="font-body text-xs font-semibold text-clay">
            Copia este token ahora — no podrás volver a verlo:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-xs">
              {token}
            </code>
            <button onClick={handleCopy} className="btn-secondary shrink-0">
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={handleGenerate} disabled={loading} className="btn-secondary">
            {loading ? "Generando..." : tokenExists ? "Generar nuevo token" : "Generar token"}
          </button>
          {tokenExists && (
            <button onClick={handleRevoke} disabled={loading} className="font-body text-sm text-red-600 hover:underline">
              Revocar
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 font-body text-sm text-red-600">{error}</p>}
      {tokenExists && !token && (
        <p className="mt-2 font-body text-xs text-ink/40">
          Ya tienes un token activo. Generar uno nuevo invalida el anterior.
        </p>
      )}
    </div>
  );
}
