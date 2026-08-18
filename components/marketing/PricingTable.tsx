const ROWS = {
  es: [
    { label: "Respuestas al mes", free: "5", pro: "Ilimitadas" },
    { label: "Los 5 tonos por reseña", free: "✓", pro: "✓" },
    { label: "Todos los tipos de negocio", free: "✓", pro: "✓" },
    { label: "Detección automática de idioma", free: "✓", pro: "✓" },
    { label: "Historial y analítica", free: "Básico", pro: "Completo" },
    { label: "Voz de marca personalizada", free: "—", pro: "✓" },
    { label: "Extensión de Chrome", free: "—", pro: "✓" },
    { label: "Informe mensual por email", free: "—", pro: "✓" },
    { label: "Soporte", free: "Comunidad", pro: "Prioritario" },
  ],
  en: [
    { label: "Replies per month", free: "5", pro: "Unlimited" },
    { label: "All 5 tones per review", free: "✓", pro: "✓" },
    { label: "Every business type", free: "✓", pro: "✓" },
    { label: "Automatic language detection", free: "✓", pro: "✓" },
    { label: "History and analytics", free: "Basic", pro: "Full" },
    { label: "Custom brand voice", free: "—", pro: "✓" },
    { label: "Chrome extension", free: "—", pro: "✓" },
    { label: "Monthly email report", free: "—", pro: "✓" },
    { label: "Support", free: "Community", pro: "Priority" },
  ],
};

export default function PricingTable({ locale = "es" }: { locale?: "es" | "en" }) {
  const rows = ROWS[locale];

  return (
    <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="border-b border-ink/10">
            <th className="p-4 text-left text-xs font-medium uppercase tracking-wide text-ink/40">
              {locale === "en" ? "Feature" : "Función"}
            </th>
            <th className="p-4 text-center text-xs font-medium uppercase tracking-wide text-ink/40">Free</th>
            <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-clay">Pro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-paper/40" : ""}>
              <td className="p-4 text-ink/70">{row.label}</td>
              <td className="p-4 text-center text-ink/50">{row.free}</td>
              <td className="p-4 text-center font-semibold text-ink">{row.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
