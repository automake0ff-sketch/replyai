"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function ReviewCaptureCard({ initialLink }: { initialLink: string }) {
  const [link, setLink] = useState(initialLink);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (link && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, link, {
        width: 180,
        margin: 1,
        color: { dark: "#14110F", light: "#FBF9F6" },
      }).catch(() => {});
    }
  }, [link]);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/update-extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewLink: link }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function downloadQr() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "reseña-qr.png";
    a.click();
  }

  return (
    <div className="mt-2 space-y-4">
      <div>
        <label className="mb-1 block font-body text-xs font-medium text-ink/50">
          Enlace de reseña de Google
        </label>
        <input
          type="url"
          maxLength={500}
          placeholder="https://g.page/r/.../review"
          className="input-field"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <p className="mt-1 font-body text-xs text-ink/40">
          Lo encuentras en Google Business Profile → Compartir perfil, o buscando tu negocio en Google Maps → "Escribir una reseña" → copiar enlace.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading} className="btn-secondary">
          {loading ? "Guardando..." : saved ? "Guardado ✓" : "Guardar enlace"}
        </button>
        {error && <p className="font-body text-sm text-red-600">{error}</p>}
      </div>

      {link && (
        <div className="rounded-xl border border-ink/10 bg-paper p-4 text-center">
          <canvas ref={canvasRef} className="mx-auto" />
          <p className="mt-3 font-body text-xs text-ink/50">
            Imprímelo en tu local o mándalo por WhatsApp: "Danos tu opinión →"
          </p>
          <button onClick={downloadQr} className="mt-3 font-body text-xs font-medium text-clay hover:underline">
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}
