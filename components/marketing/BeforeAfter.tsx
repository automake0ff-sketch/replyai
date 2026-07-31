const COPY = {
  es: {
    title: "Antes y después",
    subtitle: "Lo que ve un cliente potencial cuando busca tu negocio en Google.",
    beforeLabel: "Sin respuesta",
    afterLabel: "Con ReplyAI",
    review: '"El servicio fue lento y la comida llegó fría. Decepcionante."',
    stars: "★★☆☆☆",
    afterReply:
      "Gracias por contarnos tu experiencia. Sentimos que el tiempo de espera y la temperatura de los platos no estuvieran a la altura esa noche. Lo tenemos en cuenta para mejorar, y nos encantaría que nos dieras otra oportunidad pronto.",
    note: "Ejemplo ilustrativo — no corresponde a un negocio real.",
  },
  en: {
    title: "Before and after",
    subtitle: "What a potential customer sees when they search for your business on Google.",
    beforeLabel: "No reply",
    afterLabel: "With ReplyAI",
    review: '"Service was slow and the food arrived cold. Disappointing."',
    stars: "★★☆☆☆",
    afterReply:
      "Thanks for sharing this with us. We're sorry the wait time and food temperature didn't meet our standards that night. We're taking it into account to improve, and we'd love another chance to welcome you back soon.",
    note: "Illustrative example — not an actual business.",
  },
};

export default function BeforeAfter({ locale = "es" }: { locale?: "es" | "en" }) {
  const t = COPY[locale];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center font-display text-4xl">{t.title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-center font-body text-ink/60">{t.subtitle}</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <span className="rounded-full bg-ink/8 px-3 py-1 font-body text-xs font-semibold text-ink/50">
            {t.beforeLabel}
          </span>
          <p className="mt-4 font-body text-sm text-clay">{t.stars}</p>
          <p className="mt-2 font-body text-sm italic text-ink/70">{t.review}</p>
          <div className="mt-6 rounded-xl border border-dashed border-ink/15 p-4 text-center font-body text-xs text-ink/30">
            (sin respuesta del negocio)
          </div>
        </div>

        <div className="rounded-2xl border-2 border-clay bg-white p-6 shadow-card">
          <span className="rounded-full bg-clay/10 px-3 py-1 font-body text-xs font-semibold text-clay">
            {t.afterLabel}
          </span>
          <p className="mt-4 font-body text-sm text-clay">{t.stars}</p>
          <p className="mt-2 font-body text-sm italic text-ink/70">{t.review}</p>
          <div className="mt-4 rounded-xl bg-paper p-4">
            <p className="font-body text-sm leading-relaxed text-ink/80">{t.afterReply}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center font-body text-xs text-ink/30">{t.note}</p>
    </section>
  );
}
