const FAQS = {
  es: [
    {
      q: "¿Es seguro para el SEO de mi negocio?",
      a: "Sí. Responder a reseñas es una señal positiva para Google, y nuestras respuestas están pensadas para sonar naturales — nunca forzamos palabras clave de forma artificial. El tono SEO Local integra tu nombre y zona de forma orgánica, no como relleno.",
    },
    {
      q: "¿Cómo maneja las reseñas negativas?",
      a: "Con un tono específico para eso: reconoce el problema sin admitir culpa legal, evita sonar defensivo, invita a resolverlo en privado (sin inventar datos de contacto) y transmite que el negocio mejora con el feedback. Tú siempre revisas la respuesta antes de publicarla.",
    },
    {
      q: "¿Puedo conectar mi cuenta de Google Business Profile?",
      a: "Ahora mismo generas la respuesta en ReplyAI y la pegas en Google Business (o usas nuestra extensión de Chrome, en beta). La integración con publicación directa vía la API oficial de Google está en nuestra hoja de ruta — más abajo te contamos el estado.",
    },
    {
      q: "¿En qué idioma responde?",
      a: "ReplyAI detecta el idioma en el que está escrita la reseña y responde en ese mismo idioma automáticamente — útil si tu negocio recibe clientes internacionales.",
    },
    {
      q: "¿Necesito tarjeta para probarlo?",
      a: "No. El plan Free incluye 20 respuestas al mes sin pedir tarjeta.",
    },
    {
      q: "¿Puedo personalizar el tono de las respuestas?",
      a: "Sí, de dos formas: eliges entre 5 tonos ya diseñados (profesional, cercano, premium, SEO local, reseña negativa) en cada generación, y además puedes configurar una 'voz de marca' en Ajustes — instrucciones libres como 'firma siempre como Ana' o 'nunca menciones descuentos' — que se aplican automáticamente a todas tus respuestas.",
    },
    {
      q: "¿Funciona con TripAdvisor, Yelp o Facebook, además de Google?",
      a: "Ahora mismo ReplyAI está enfocado en reseñas de Google, que es donde la mayoría de negocios locales reciben el grueso de su volumen. Integrar otras plataformas de reseñas es algo que valoramos para el futuro, pero no está disponible todavía.",
    },
    {
      q: "¿Cumple con el RGPD?",
      a: "Tratamos tus datos conforme al RGPD: solo usamos lo necesario para prestar el servicio, no vendemos tus datos a terceros, y puedes ejercer tus derechos de acceso, rectificación y eliminación en cualquier momento. Todos los detalles — qué datos tratamos, con qué proveedores los compartimos (Supabase, OpenRouter, Stripe, Resend) y cómo ejercer tus derechos — están en nuestra Política de Privacidad, enlazada en el pie de página.",
    },
  ],
  en: [
    {
      q: "Is it safe for my business's SEO?",
      a: "Yes. Replying to reviews is a positive signal for Google, and our replies are written to sound natural — we never force keywords artificially. The Local SEO tone weaves in your name and area organically, not as filler.",
    },
    {
      q: "How does it handle negative reviews?",
      a: "With a dedicated tone: it acknowledges the issue without admitting legal fault, avoids sounding defensive, invites the customer to resolve it privately (without inventing contact details), and conveys that the business is improving from the feedback. You always review the reply before posting it.",
    },
    {
      q: "Can I connect my Google Business Profile account?",
      a: "Right now you generate the reply in ReplyAI and paste it into Google Business (or use our Chrome extension, currently in beta). Direct publishing via Google's official API is on our roadmap — see below for the current status.",
    },
    {
      q: "What language does it reply in?",
      a: "ReplyAI detects the language the review is written in and automatically replies in that same language — useful if your business gets international customers.",
    },
    {
      q: "Do I need a card to try it?",
      a: "No. The Free plan includes 20 replies per month, no card required.",
    },
    {
      q: "Can I customize the tone of the replies?",
      a: "Yes, two ways: pick from 5 built-in tones (professional, friendly, premium, local SEO, negative review) on every generation, and you can also set a 'brand voice' in Settings — free-form instructions like 'always sign as Ana' or 'never mention discounts' — applied automatically to every reply.",
    },
    {
      q: "Does it work with TripAdvisor, Yelp, or Facebook, besides Google?",
      a: "Right now ReplyAI is focused on Google reviews, where most local businesses get the bulk of their volume. Supporting other review platforms is something we're considering for the future, but it's not available yet.",
    },
    {
      q: "Is it GDPR compliant?",
      a: "We handle your data in line with GDPR: we only use what's needed to run the service, we never sell your data, and you can exercise your access, rectification, and deletion rights at any time. Full details — what data we process, which providers we share it with (Supabase, OpenRouter, Stripe, Resend), and how to exercise your rights — are in our Privacy Policy, linked in the footer.",
    },
  ],
};

export default function FaqSection({ locale = "es" }: { locale?: "es" | "en" }) {
  const items = FAQS[locale];
  const title = locale === "en" ? "Frequently asked questions" : "Preguntas frecuentes";

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="text-center font-display text-4xl">{title}</h2>
      <div className="mt-10 space-y-4">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-ink/10 bg-white p-5 shadow-card open:pb-5"
          >
            <summary className="cursor-pointer list-none font-body text-sm font-semibold text-ink marker:content-none">
              <span className="flex items-center justify-between">
                {item.q}
                <span className="ml-4 text-ink/30 transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink/60">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
