const COPY = {
  es: {
    label: "Próximamente",
    text: "Automatización directa con Google Business Profile — genera y publica tu respuesta sin salir de Google. Ya estamos trabajando en ello.",
  },
  en: {
    label: "Coming soon",
    text: "Direct automation with Google Business Profile — generate and publish your reply without leaving Google. Already in the works.",
  },
};

export default function RoadmapTeaser({ locale = "es" }: { locale?: "es" | "en" }) {
  const t = COPY[locale];

  return (
    <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full border border-clay/25 bg-clay/5 px-5 py-3">
      <span className="shrink-0 rounded-full bg-clay/15 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-clay">
        {t.label}
      </span>
      <p className="font-body text-xs text-ink/60">{t.text}</p>
    </div>
  );
}
