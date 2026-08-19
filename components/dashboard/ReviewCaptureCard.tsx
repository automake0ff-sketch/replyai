"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function ReviewCaptureCard({
  initialLink,
  businessName,
}: {
  initialLink: string;
  businessName: string;
}) {
  const [link, setLink] = useState(initialLink);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);
  const [printReady, setPrintReady] = useState(false);

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

  // Genera un diseño listo para imprimir (como los soportes de mesa con
  // QR + NFC que se ven en restaurantes reales): no reproduce el
  // logotipo de Google tal cual (evitamos el asset de marca), en su
  // lugar dibujamos la palabra "Google" con los 4 colores de su
  // identidad — referencia habitual y reconocible sin copiar el icono.
  async function drawPrintableCard() {
    const canvas = printCanvasRef.current;
    if (!canvas || !link) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 900;
    const H = 1400;
    canvas.width = W;
    canvas.height = H;

    // Fondo
    ctx.fillStyle = "#FBF9F6";
    ctx.fillRect(0, 0, W, H);

    // Marco sutil
    ctx.strokeStyle = "#E8E3DB";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // --- Icono NFC (arriba izquierda): rectángulo tipo móvil + ondas ---
    const nfcX = 130;
    const nfcY = 220;
    ctx.strokeStyle = "#14110F";
    ctx.lineWidth = 6;
    ctx.strokeRect(nfcX - 70, nfcY - 90, 90, 150);
    ctx.beginPath();
    ctx.arc(nfcX + 60, nfcY - 40, 30, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(nfcX + 60, nfcY - 40, 55, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.font = "600 26px Arial";
    ctx.fillStyle = "#14110F";
    ctx.textAlign = "center";
    ctx.fillText("NFC", nfcX, nfcY + 110);

    // --- QR (arriba derecha) ---
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, link, {
      width: 260,
      margin: 0,
      color: { dark: "#14110F", light: "#FBF9F6" },
    });
    ctx.drawImage(qrCanvas, W - 130 - 260, nfcY - 130, 260, 260);

    // --- "Google" con sus 4 colores (referencia, no el logotipo) ---
    const googleY = 520;
    const letters = [
      { ch: "G", color: "#4285F4" },
      { ch: "o", color: "#EA4335" },
      { ch: "o", color: "#FBBC05" },
      { ch: "g", color: "#4285F4" },
      { ch: "l", color: "#34A853" },
      { ch: "e", color: "#EA4335" },
    ];
    ctx.font = "700 70px Arial";
    ctx.textAlign = "left";
    const totalWidth = letters.reduce((sum, l) => sum + ctx.measureText(l.ch).width, 0);
    let cursorX = W / 2 - totalWidth / 2;
    for (const l of letters) {
      ctx.fillStyle = l.color;
      ctx.fillText(l.ch, cursorX, googleY);
      cursorX += ctx.measureText(l.ch).width;
    }

    // --- Texto ---
    ctx.textAlign = "center";
    ctx.fillStyle = "#14110F";
    ctx.font = "600 40px Arial";
    ctx.fillText("Escribe una reseña", W / 2, googleY + 90);
    ctx.fillText("sobre nosotros", W / 2, googleY + 145);

    // --- Estrellas ---
    const starY = googleY + 230;
    const starSize = 42;
    const starGap = 58;
    const starsStartX = W / 2 - (starGap * 2);
    ctx.fillStyle = "#C9603A";
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, starsStartX + i * starGap, starY, starSize / 2);
    }

    // --- Barra inferior con el nombre del negocio ---
    const barH = 220;
    ctx.fillStyle = "#14110F";
    ctx.fillRect(20, H - 20 - barH, W - 40, barH);
    ctx.fillStyle = "#FBF9F6";
    ctx.font = "700 48px Arial";
    ctx.textAlign = "center";
    const name = businessName?.trim() || "Tu negocio";
    ctx.fillText(name.toUpperCase(), W / 2, H - 20 - barH / 2 - 5, W - 100);
    ctx.font = "400 22px Arial";
    ctx.fillStyle = "#C9603A";
    ctx.fillText("Generado con ReplyAI", W / 2, H - 20 - barH / 2 + 45);

    setPrintReady(true);
  }

  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const spikes = 5;
    const inset = r * 0.45;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * inset, cy + Math.sin(rot) * inset);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }

  useEffect(() => {
    if (link) drawPrintableCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, businessName]);

  function downloadPrintableCard() {
    if (!printCanvasRef.current) return;
    const url = printCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta-reseña-imprimible.png";
    a.click();
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
            <p className="mb-2 font-body text-xs font-medium text-ink/60">
              Diseño para imprimir (QR + NFC, con el nombre de tu negocio)
            </p>
            <canvas
              ref={printCanvasRef}
              className={`mx-auto rounded-lg border border-ink/10 ${printReady ? "" : "hidden"}`}
              style={{ width: 180, height: 280 }}
            />
            <button
              onClick={downloadPrintableCard}
              disabled={!printReady}
              className="btn-secondary mt-3"
            >
              Descargar diseño (PNG)
            </button>
            <p className="mt-2 font-body text-xs text-ink/40">
              Imprímelo y ponlo en un soporte de mesa (los de acrílico cuestan 2-4€ en Amazon/AliExpress
              buscando "soporte menú acrílico A6/A7"), o llévalo a una copistería para plastificarlo.
            </p>
          </div>

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
                Grabar tarjetas NFC desde el navegador solo funciona en Chrome o Samsung Internet sobre Android — no está disponible en iPhone ni en ordenador. La tarjeta descargada arriba ya lleva el QR (funciona en cualquier dispositivo); si además quieres que el tap NFC funcione, usa una app de grabación NFC gratuita desde un móvil Android compatible para escribir este mismo enlace en la pegatina.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
