import Link from "next/link";

export default function ArticleLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <Link href="/blog" className="font-body text-sm text-ink/60 hover:text-ink">
          ← Blog
        </Link>
      </header>

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-8">
        <h1 className="font-display text-4xl leading-tight">{title}</h1>
        <p className="mt-3 font-body text-base text-ink/60">{subtitle}</p>

        <div className="prose-article mt-10 font-body text-[15px] leading-relaxed text-ink/80">
          {children}
        </div>

        <div className="mt-14 rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-card">
          <p className="font-display text-2xl">Pruébalo con una reseña real</p>
          <p className="mx-auto mt-2 max-w-sm font-body text-sm text-ink/60">
            Pega una reseña de tu negocio y mira la respuesta que genera ReplyAI, gratis y sin registro.
          </p>
          <Link href="/#precios" className="btn-primary mt-6 inline-flex">
            Probar gratis →
          </Link>
        </div>
      </article>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
