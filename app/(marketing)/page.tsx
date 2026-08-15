import Link from "next/link";
import LandingDemo from "@/components/generator/LandingDemo";
import BeforeAfter from "@/components/marketing/BeforeAfter";
import FounderGuarantee from "@/components/marketing/FounderGuarantee";
import FaqSection from "@/components/marketing/FaqSection";
import RoadmapTeaser from "@/components/marketing/RoadmapTeaser";
import PricingTable from "@/components/marketing/PricingTable";
import LaunchBanner from "@/components/marketing/LaunchBanner";
import ProductHuntBadge from "@/components/marketing/ProductHuntBadge";

const BUSINESS_TYPES = [
  "Restaurantes",
  "Clínicas dentales",
  "Inmobiliarias",
  "Hoteles",
  "Talleres",
  "Peluquerías",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <LaunchBanner locale="es" />
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl italic">ReplyAI</span>
        <div className="flex items-center gap-3">
          <Link href="/en" className="font-body text-sm text-ink/50 hover:text-ink">
            EN
          </Link>
          <Link href="/login" className="font-body text-sm text-ink/70 hover:text-ink">
            Iniciar sesión
          </Link>
          <Link href="/signup" className="btn-primary">
            Prueba gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <div className="mb-6 flex justify-center">
          <ProductHuntBadge url="https://www.producthunt.com/products/reply-ai-4?launch=reply-ai-4" />
        </div>
        <p className="mb-5 font-body text-sm uppercase tracking-[0.2em] text-clay">
          Reputación local · Impulsada por IA
        </p>
        <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
          Responde a tus reseñas de Google
          <br />
          <span className="italic text-clay">en 10 segundos</span>, no en 10 minutos.
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-body text-lg text-ink/70">
          ReplyAI genera respuestas profesionales, cercanas y humanas a cada
          reseña de tu negocio. Sin plantillas robóticas. Sin quedarte en
          blanco delante de una reseña negativa.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary">
            Prueba gratis — sin tarjeta
          </Link>
          <a href="#como-funciona" className="btn-secondary">
            Ver cómo funciona
          </a>
        </div>
        <p className="mt-4 font-body text-xs text-ink/40">
          {BUSINESS_TYPES.join(" · ")}
        </p>
      </section>

      {/* Demo pública */}
      <section className="mx-auto max-w-2xl px-6 pb-20">
        <LandingDemo locale="es" />
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Reputación",
              text: "Cada respuesta refuerza confianza y demuestra que hay alguien cuidando tu negocio.",
            },
            {
              title: "Tiempo",
              text: "Deja de improvisar respuestas. Genera las 5 mejores variantes en un clic.",
            },
            {
              title: "SEO local",
              text: "Respuestas que integran tu negocio y tu zona de forma natural, sin sonar forzadas.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-ink/10 bg-white p-7 shadow-card">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-2 font-body text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-4xl">Cómo funciona</h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
            { step: "01", title: "Elige tu negocio", text: "Restaurante, clínica, hotel, taller... el tono se adapta." },
            { step: "02", title: "Pega la reseña", text: "Copia el texto del cliente, sin importar si es positiva o negativa." },
            { step: "03", title: "Copia tu respuesta", text: "5 tonos distintos, listos para pegar en Google Business." },
          ].map((item) => (
            <div key={item.step}>
              <span className="font-display text-3xl italic text-clay">{item.step}</span>
              <h3 className="mt-3 font-body text-base font-semibold">{item.title}</h3>
              <p className="mt-1 font-body text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Antes / Después */}
      <BeforeAfter locale="es" />

      {/* Garantía del fundador (honesta: sin testimonios inventados) */}
      <FounderGuarantee locale="es" />

      {/* Precios */}
      <section id="precios" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center font-display text-4xl">Precios simples</h2>
        <p className="mt-3 text-center font-body text-ink/60">
          Empieza gratis. Sube de plan cuando lo necesites.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-card">
            <h3 className="font-display text-2xl">Free</h3>
            <p className="mt-2 font-display text-4xl">0€</p>
            <p className="font-body text-sm text-ink/50">15 respuestas al mes</p>
            <ul className="mt-6 space-y-2 font-body text-sm text-ink/70">
              <li>✓ 5 tonos por reseña</li>
              <li>✓ Todos los tipos de negocio</li>
              <li>✓ Historial básico</li>
            </ul>
            <Link href="/signup" className="btn-secondary mt-8 w-full">
              Empezar gratis
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-clay bg-white p-8 shadow-card">
            <span className="rounded-full bg-clay/10 px-3 py-1 font-body text-xs font-semibold text-clay">
              MÁS POPULAR
            </span>
            <h3 className="mt-3 font-display text-2xl">Pro</h3>
            <p className="mt-2 font-display text-4xl">19€<span className="text-base text-ink/50">/mes</span></p>
            <p className="font-body text-sm text-ink/50">Respuestas ilimitadas</p>
            <ul className="mt-6 space-y-2 font-body text-sm text-ink/70">
              <li>✓ Todo lo de Free</li>
              <li>✓ Respuestas ilimitadas</li>
              <li>✓ Soporte prioritario</li>
            </ul>
            <Link href="/signup" className="btn-primary mt-8 w-full">
              Empezar con Pro
            </Link>
          </div>
        </div>
        <PricingTable locale="es" />
        <RoadmapTeaser locale="es" />
      </section>

      {/* FAQ */}
      <FaqSection locale="es" />

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="font-display text-4xl">
          Tu próxima reseña merece <span className="italic text-clay">una buena respuesta</span>.
        </h2>
        <Link href="/signup" className="btn-primary mt-8 inline-flex">
          Prueba ReplyAI gratis
        </Link>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        <Link href="/blog" className="hover:text-ink/70">Blog</Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-ink/70">Privacidad</Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-ink/70">Términos</Link>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
