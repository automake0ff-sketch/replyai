import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — ReplyAI",
  description: "Cómo ReplyAI trata tus datos personales, de acuerdo con el RGPD.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <Link href="/" className="font-body text-sm text-ink/60 hover:text-ink">
          ← Inicio
        </Link>
      </header>

      <article className="mx-auto max-w-2xl px-6 pb-24 pt-8">
        <h1 className="font-display text-4xl">Política de Privacidad</h1>
        <p className="mt-2 font-body text-sm text-ink/50">Última actualización: agosto de 2026</p>

        <div className="mt-6 rounded-xl border border-clay/30 bg-clay/5 p-4">
          <p className="font-body text-xs leading-relaxed text-ink/70">
            Este documento es un borrador redactado para ofrecer información clara y de buena fe, no asesoría legal. Antes de considerar ReplyAI plenamente conforme con el RGPD/LOPDGDD, recomendamos que un profesional legal lo revise — el cumplimiento normativo tiene implicaciones reales y no debe depender solo de este texto.
          </p>
        </div>

        <div className="prose-article mt-8 font-body text-[15px] leading-relaxed text-ink/80">
          <h2>1. Quién trata tus datos</h2>
          <p>
            ReplyAI es un servicio operado por Alejandro (Sevilla, España). Para
            cualquier consulta sobre privacidad o para ejercer tus derechos,
            puedes escribir a través del correo asociado a tu cuenta o desde el
            formulario de contacto del sitio.
          </p>

          <h2>2. Qué datos tratamos</h2>
          <ul>
            <li><strong>Datos de cuenta:</strong> email, y contraseña cifrada (o identificador de Google si te registras con ese método).</li>
            <li><strong>Datos de tu negocio:</strong> nombre del negocio, tipo de negocio, instrucciones de voz de marca — los que tú decidas introducir en Ajustes.</li>
            <li><strong>Contenido que generas:</strong> el texto de las reseñas que pegas y las respuestas generadas, guardadas en tu historial.</li>
            <li><strong>Datos de pago:</strong> gestionados directamente por Stripe — nosotros no almacenamos números de tarjeta.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, únicamente para limitar el abuso de la demo pública y evitarlo en el servicio de generación.</li>
          </ul>

          <h2>3. Para qué usamos tus datos</h2>
          <p>
            Para prestarte el servicio (generar respuestas, gestionar tu cuenta
            y suscripción), para comunicaciones operativas (confirmación de
            cuenta, avisos de créditos, informe mensual si tienes plan Pro), y
            para prevenir abuso del servicio gratuito. La base legal es la
            ejecución del contrato de servicio que aceptas al registrarte, y en
            el caso de la prevención de abuso, nuestro interés legítimo.
          </p>

          <h2>4. Con quién compartimos datos</h2>
          <p>
            No vendemos tus datos. Los compartimos únicamente con los
            proveedores necesarios para operar el servicio, que actúan como
            encargados del tratamiento:
          </p>
          <ul>
            <li><strong>Supabase</strong> — base de datos y autenticación.</li>
            <li><strong>OpenRouter</strong> y los proveedores de modelos de IA a los que enruta la petición — para generar el texto de las respuestas. El texto de tu reseña se envía a estos proveedores en el momento de generar una respuesta; algunos pueden estar ubicados fuera del Espacio Económico Europeo.</li>
            <li><strong>Stripe</strong> — procesamiento de pagos.</li>
            <li><strong>Resend</strong> — envío de emails transaccionales (confirmación, avisos, informe mensual).</li>
            <li><strong>Vercel</strong> — alojamiento de la aplicación, y analítica de uso agregada (páginas visitadas, sin cookies ni identificación individual).</li>
          </ul>

          <h2>5. Cuánto tiempo conservamos tus datos</h2>
          <p>
            Mientras tu cuenta esté activa. Si la eliminas, borramos tus datos
            de perfil y tu historial de generaciones en un plazo razonable,
            salvo la información que debamos conservar por obligación legal
            (por ejemplo, registros de facturación).
          </p>

          <h2>6. Tus derechos</h2>
          <p>
            Bajo el RGPD tienes derecho a acceder, rectificar, eliminar,
            limitar u oponerte al tratamiento de tus datos, y a la
            portabilidad de los mismos. Puedes ejercerlos escribiéndonos
            directamente. También tienes derecho a presentar una reclamación
            ante la Agencia Española de Protección de Datos (AEPD) si
            consideras que no hemos atendido tu solicitud correctamente.
          </p>

          <h2>7. Cookies y analítica</h2>
          <p>
            Usamos únicamente una cookie técnica de sesión, necesaria para
            mantenerte identificado tras iniciar sesión. No usamos cookies de
            publicidad ni de seguimiento de terceros. Para medir el uso
            agregado del sitio (qué páginas se visitan, cuánto tráfico
            recibimos) usamos Vercel Analytics, que no instala cookies ni
            identifica visitantes de forma individual.
          </p>

          <h2>8. Cambios en esta política</h2>
          <p>
            Si actualizamos este documento de forma relevante, lo indicaremos
            en esta misma página con la fecha de la última actualización.
          </p>
        </div>
      </article>

      <footer className="border-t border-ink/10 py-8 text-center font-body text-xs text-ink/40">
        © {new Date().getFullYear()} ReplyAI
      </footer>
    </main>
  );
}
