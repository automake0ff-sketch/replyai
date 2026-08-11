const COPY = {
  es: {
    text: "🚀 Lanzamiento: 30% de descuento de por vida para los primeros 50 — código",
    code: "LANZAMIENTO30",
    hint: "en el checkout",
  },
  en: {
    text: "🚀 Launch offer: 30% off for life for the first 50 — code",
    code: "LAUNCH30",
    hint: "at checkout",
  },
};

export default function LaunchBanner({ locale = "es" }: { locale?: "es" | "en" }) {
  const t = COPY[locale];

  return (
    <div className="bg-ink py-2.5 text-center">
      <p className="font-body text-xs text-paper sm:text-sm">
        {t.text}{" "}
        <span className="rounded-full bg-clay/90 px-2.5 py-0.5 font-mono font-semibold">
          {t.code}
        </span>{" "}
        <span className="text-paper/60">{t.hint}</span>
      </p>
    </div>
  );
}
