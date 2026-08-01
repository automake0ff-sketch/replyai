import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type MonthlyStats = {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  businessName?: string | null;
};

function renderReportHtml(stats: MonthlyStats) {
  const name = stats.businessName || "tu negocio";
  const pct = (n: number) => (stats.total > 0 ? Math.round((n / stats.total) * 100) : 0);

  return `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #14110F;">
    <p style="font-size: 20px; font-style: italic; margin: 0 0 24px;">ReplyAI</p>
    <h1 style="font-size: 22px; margin: 0 0 8px;">Tu resumen del último mes</h1>
    <p style="font-size: 14px; color: #14110F99; margin: 0 0 24px;">${name}</p>

    <div style="background: #FBF9F6; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #14110F66; margin: 0 0 4px;">Respuestas generadas</p>
      <p style="font-size: 32px; margin: 0; font-weight: 600;">${stats.total}</p>
    </div>

    <div style="background: #FBF9F6; border-radius: 16px; padding: 20px;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #14110F66; margin: 0 0 12px;">Sentimiento de las reseñas</p>
      <p style="font-size: 13px; margin: 4px 0;">🟢 Positivas: ${pct(stats.positive)}%</p>
      <p style="font-size: 13px; margin: 4px 0;">⚪ Neutras: ${pct(stats.neutral)}%</p>
      <p style="font-size: 13px; margin: 4px 0;">🟠 Negativas: ${pct(stats.negative)}%</p>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/history" style="display: inline-block; margin-top: 24px; background: #14110F; color: #FBF9F6; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px;">
      Ver historial completo
    </a>

    <p style="font-size: 11px; color: #14110F66; margin-top: 32px;">
      Recibes esto porque usaste ReplyAI el último mes. Puedes gestionar tu cuenta desde Ajustes.
    </p>
  </div>`;
}

export async function sendMonthlyReport(to: string, stats: MonthlyStats) {
  await resend.emails.send({
    // Remitente de pruebas de Resend: funciona sin verificar dominio
    // propio. Antes de enviar a clientes reales de forma masiva,
    // verifica tu propio dominio en resend.com/domains y cambia esto a
    // algo como "ReplyAI <hola@tudominio.com>" — mejora la entregabilidad
    // y evita que caiga en spam.
    from: "ReplyAI <onboarding@resend.dev>",
    to,
    subject: "Tu resumen mensual de ReplyAI",
    html: renderReportHtml(stats),
  });
}

function renderLowCreditsHtml(creditsRemaining: number) {
  return `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #14110F;">
    <p style="font-size: 20px; font-style: italic; margin: 0 0 24px;">ReplyAI</p>
    <h1 style="font-size: 22px; margin: 0 0 8px;">Te quedan ${creditsRemaining} respuestas este mes</h1>
    <p style="font-size: 14px; color: #14110F99; line-height: 1.6; margin: 12px 0 24px;">
      Tu plan Free incluye 20 respuestas al mes. Cuando se agoten, tendrás
      que esperar al reset del mes que viene — o pasarte a Pro para
      respuestas ilimitadas desde ya.
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="display: inline-block; background: #14110F; color: #FBF9F6; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px;">
      Pasar a Pro — 19€/mes
    </a>
    <p style="font-size: 11px; color: #14110F66; margin-top: 32px;">
      Recibes esto porque estás cerca del límite de tu plan Free.
    </p>
  </div>`;
}

export async function sendLowCreditsWarning(to: string, creditsRemaining: number) {
  await resend.emails.send({
    from: "ReplyAI <onboarding@resend.dev>",
    to,
    subject: `Te quedan ${creditsRemaining} respuestas gratis este mes`,
    html: renderLowCreditsHtml(creditsRemaining),
  });
}
