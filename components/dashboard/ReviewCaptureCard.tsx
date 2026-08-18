"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function ReviewCaptureCard({ initialLink }: { initialLink: string }) {
  const [link, setLink] = useState(initialLink);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Web NFC (NDEFReader) solo está disponible en Chrome/Samsung Internet
  // sobre Android, con HTTPS y con un tap del usuario — no existe en
  // iOS/Safari ni en ningún navegador de escritorio. Por eso se detecta
  // la capacidad en tiempo real y se explica la limitación en vez de
  // mostrar un botón que no va a funcionar para la mayoría.
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<"idle" | "writing" | "success" | "error">("idle");
  const [nfcError, setNfcError] = useState<string | null>(null);

  useEffect(() => {
    setNfcSupported(typeof window !== "undefined" && "NDEFReader" in window);
  }, []);

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

  async function writeNfcTag() {
    if (!link) return;
    setNfcStatus("writing");
    setNfcError(null);
    try {
      // @ts-expect-error: NDEFReader no está en los tipos estándar de TS/DOM todavía
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: link }] });
      setNfcStatus("success");
      setTimeout(() => setNfcStatus("idle"), 2500);
    } catch (err) {
      setNfcStatus("error");
      const message = err instanceof Error ? err.message : "";
      setNfcError(
        message.toLowerCase().includes("not allowed") || message.toLowerCase().includes("permission")
          ? "Permiso de NFC denegado. Actívalo en los ajustes del navegador e inténtalo de nuevo."
          : "No se pudo escribir en la tarjeta. Acércala al móvil y vuelve a intentarlo."
      );
    }
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

          <div className="mt-4 border-t border-ink/10 pt-4">
            <p className="mb-2 font-body text-xs font-medium text-ink/60">Tarjeta NFC (opcional, además del QR)</p>

            {nfcSupported ? (
              <>
                <button
                  onClick={writeNfcTag}
                  disabled={nfcStatus === "writing"}
                  className="btn-secondary"
                >
                  {nfcStatus === "writing"
                    ? "Acerca la tarjeta al móvil..."
                    : nfcStatus === "success"
                    ? "Tarjeta grabada ✓"
                    : "Grabar tarjeta NFC"}
                </button>
                {nfcStatus === "error" && nfcError && (
                  <p className="mt-2 font-body text-xs text-red-600">{nfcError}</p>
                )}
                <p className="mt-2 font-body text-xs text-ink/40">
                  Necesitas una tarjeta o pegatina NFC en blanco (tipo NTAG213/215, se compran sueltas online) y acercarla a la parte trasera del móvil cuando lo pida.
                </p>
              </>
            ) : (
              <p className="font-body text-xs text-ink/40">
                Grabar tarjetas NFC desde el navegador solo funciona en Chrome o Samsung Internet sobre Android — no está disponible en iPhone ni en ordenador. Descarga el QR de arriba, que funciona en cualquier dispositivo, o usa una app de grabación NFC gratuita desde un móvil Android compatible para escribir este mismo enlace en la tarjeta.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
