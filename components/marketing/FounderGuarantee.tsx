const COPY = {
  es: {
    eyebrow: "Compromiso del fundador",
    title: "Somos nuevos. Por eso no te pedimos que confíes a ciegas.",
    body: "ReplyAI acaba de lanzarse — preferimos decirlo claro en vez de inventar reseñas de clientes que aún no existen. Pruébalo gratis con una reseña real de tu negocio antes de pagar nada.",
    signature: "— El equipo de ReplyAI",
  },
  en: {
    eyebrow: "Founder's commitment",
    title: "We're new. That's why we won't ask you to trust us blindly.",
    body: "ReplyAI just launched — we'd rather say that plainly than make up customer reviews that don't exist yet. Try it free with a real review from your business before paying anything.",
    signature: "— The ReplyAI team",
  },
};

export default function FounderGuarantee({ locale = "es" }: { locale?: "es" | "en" }) {
  const t = COPY[locale];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-card sm:p-10">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-clay">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-ink/60">
          {t.body}
        </p>
        <p className="mt-6 font-display italic text-ink/50">{t.signature}</p>
      </div>
    </section>
  );
}
