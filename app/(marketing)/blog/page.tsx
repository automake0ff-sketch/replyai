import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — ReplyAI",
  description: "Consejos prácticos para gestionar la reputación online de tu negocio local: cómo responder reseñas, SEO local, y más.",
};

const POSTS = [
  {
    slug: "como-responder-resena-negativa-google",
    title: "Cómo responder a una reseña negativa en Google (con ejemplos)",
    excerpt: "La reseña de 2 estrellas no tiene por qué ser un desastre. Con la respuesta correcta, puede convertirse en la prueba de que tu negocio se toma en serio a sus clientes.",
  },
  {
    slug: "resenas-google-seo-local",
    title: "Por qué responder a tus reseñas de Google mejora tu SEO local",
    excerpt: "No es una leyenda urbana: Google sí tiene en cuenta cómo interactúas con tus reseñas a la hora de posicionarte en las búsquedas locales.",
  },
  {
    slug: "errores-responder-resenas-negativas",
    title: "5 errores comunes al responder reseñas negativas (y cómo evitarlos)",
    excerpt: "Desde ponerse a la defensiva hasta copiar la misma plantilla siempre — los fallos más habituales, y qué hacer en su lugar.",
  },
  {
    slug: "replyai-vs-reply-champion-vs-replifast",
    title: "ReplyAI vs Reply Champion vs RepliFast: comparativa honesta",
    excerpt: "Escrita por el fundador de ReplyAI, con el mismo sesgo evidente que cualquier comparativa de un fundador — pero con los datos verificados.",
  },
  {
    slug: "como-conseguir-mas-resenas-google",
    title: "Cómo conseguir más reseñas de Google para tu negocio",
    excerpt: "El truco no es pedir reseñas mejor, es pedirlas en el momento correcto y quitar toda la fricción posible.",
  },
  {
    slug: "plantillas-respuestas-resenas-google",
    title: "Plantillas de respuestas a reseñas de Google gratis",
    excerpt: "Listas para copiar y adaptar, positivas y negativas — con la advertencia de por qué copiarlas tal cual no es tan buena idea como parece.",
  },
  {
    slug: "como-responder-resenas-restaurantes",
    title: "Cómo responder reseñas de Google para restaurantes",
    excerpt: "Las quejas de un restaurante se repiten siempre: tiempo de espera, temperatura del plato, ruido, precio. Cómo responder a cada una.",
  },
];

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <Link href="/" className="font-body text-sm text-ink/60 hover:text-ink">
          ← Inicio
        </Link>
      </header>

      <section className="mx-auto max-w-2xl px-6 pb-24 pt-8">
        <h1 className="font-display text-4xl">Blog</h1>
        <p className="mt-3 font-body text-ink/60">
          Consejos prácticos para responder reseñas y cuidar la reputación de tu negocio.
        </p>

        <div className="mt-12 space-y-8">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card transition-transform hover:scale-[1.01]">
                <h2 className="font-display text-2xl">{post.title}</h2>
                <p className="mt-2 font-body text-sm text-ink/60">{post.excerpt}</p>
                <span className="mt-3 inline-block font-body text-sm font-medium text-clay">
                  Leer →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
