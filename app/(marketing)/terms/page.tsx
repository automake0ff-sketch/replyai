import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio — ReplyAI",
  description: "Condiciones de uso del servicio ReplyAI.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <Link href="/" className="font-body text-sm text-ink/60 hover:text-ink">
          ← Inicio
        </Link>
      </header>

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-8">
        <h1 className="font-display text-4xl">Términos de Servicio</h1>
        <p className="mt-2 font-body text-sm text-ink/50">Última actualización: agosto de 2026</p>

        <div className="mt-6 rounded-xl border border-clay/30 bg-clay/5 p-4">
          <p className="font-body text-xs leading-relaxed text-ink/70">
            Este documento es un borrador redactado de buena fe, no asesoría
            legal. Recomendamos revisión profesional antes de considerarlo
            definitivo, especialmente en lo relativo a limitación de
            responsabilidad y condiciones de facturación.
          </p>
        </div>

        <div className="prose-article mt-8 font-body text-[15px] leading-relaxed text-ink/80">
          <h2>1. Qué es ReplyAI</h2>
          <p>
            ReplyAI es un servicio que genera, mediante inteligencia
            artificial, sugerencias de texto para responder a reseñas de
            clientes. Al usar el servicio, aceptas estos términos.
          </p>

          <h2>2. Tu responsabilidad sobre el contenido generado</h2>
          <p>
            <strong>Esto es importante:</strong> ReplyAI genera sugerencias de
            texto. Tú decides qué publicar, dónde y cuándo. Eres responsable
            de revisar cada respuesta antes de publicarla en tu perfil de
            Google Business o donde corresponda. No garantizamos que el texto
            generado esté libre de errores, sea legalmente idóneo para tu
            situación concreta, o adecuado en todos los casos — es una
            herramienta de apoyo, no un sustituto de tu propio criterio.
          </p>

          <h2>3. Cuentas y uso aceptable</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu contraseña
            y de tu token de la extensión de Chrome. No uses el servicio para
            generar contenido difamatorio, engañoso, o que infrinja derechos
            de terceros. Nos reservamos el derecho de suspender cuentas que
            abusen del servicio (por ejemplo, uso automatizado excesivo de la
            demo pública o intentos de eludir los límites de créditos).
          </p>

          <h2>4. Planes, pagos y cancelación</h2>
          <ul>
            <li>El plan Free incluye un número limitado de respuestas al mes, sin coste.</li>
            <li>Los planes de pago se facturan mensualmente por adelantado a través de Stripe.</li>
            <li>Puedes cancelar tu suscripción en cualquier momento desde el Portal de Facturación (Ajustes → Gestionar facturación) — la cancelación surte efecto al final del período ya pagado, sin renovación posterior.</li>
            <li>No ofrecemos reembolsos de períodos ya facturados salvo que la ley aplicable lo exija, o que decidamos hacerlo de forma discrecional ante un caso justificado — escríbenos si tienes un problema, lo trataremos caso por caso.</li>
          </ul>

          <h2>5. Disponibilidad del servicio</h2>
          <p>
            El generador de respuestas depende de proveedores de inteligencia
            artificial externos. Aunque procuramos la máxima fiabilidad,
            puede haber interrupciones puntuales fuera de nuestro control. No
            garantizamos disponibilidad ininterrumpida del servicio.
          </p>

          <h2>6. Limitación de responsabilidad</h2>
          <p>
            En la medida permitida por la ley, ReplyAI no será responsable de
            daños indirectos derivados del uso del contenido generado —
            incluyendo, sin limitarse a, consecuencias de publicar una
            respuesta sin haberla revisado antes. El servicio se ofrece "tal
            cual".
          </p>

          <h2>7. Propiedad del contenido</h2>
          <p>
            El texto que generas con ReplyAI para tu negocio es tuyo para
            usarlo como quieras. No reclamamos derechos sobre las respuestas
            generadas para tu cuenta.
          </p>

          <h2>8. Cambios en estos términos</h2>
          <p>
            Si actualizamos estos términos de forma relevante, lo indicaremos
            en esta página con la fecha de la última actualización.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Para cualquier duda sobre estos términos, escríbenos a través del
            email asociado a tu cuenta o desde el formulario de contacto del
            sitio.
          </p>

          <p>
            Ver también nuestra{" "}
            <Link href="/privacy" className="text-clay underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </article>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
