import type { Metadata } from "next";
import ArticleLayout from "../ArticleLayout";

export const metadata: Metadata = {
  title: "5 errores comunes al responder reseñas negativas (y cómo evitarlos) — ReplyAI",
  description:
    "Los fallos más habituales al contestar reseñas negativas en Google, con ejemplos de qué evitar y qué hacer en su lugar.",
};

export default function Article() {
  return (
    <ArticleLayout
      title="5 errores comunes al responder reseñas negativas (y cómo evitarlos)"
      subtitle="Desde ponerse a la defensiva hasta copiar la misma plantilla siempre — los fallos más habituales, y qué hacer en su lugar."
    >
      <h2>1. Responder en caliente</h2>
      <p>
        La reseña te sienta mal, y quince minutos después ya has publicado
        una respuesta que empieza por "esto es totalmente falso". El
        problema no es solo el tono — es que esa respuesta queda ahí para
        siempre, y la lee gente que no tiene ningún contexto de por qué
        estabas enfadado esa tarde.
      </p>
      <p>
        <strong>Mejor:</strong> deja pasar al menos unas horas antes de
        responder a algo que te ha molestado. Si usas una herramienta que
        genera la respuesta por ti, es más fácil mantener un tono estable
        incluso cuando tú, como persona, estás lejos de estar calmado.
      </p>

      <h2>2. Admitir culpa legal sin darte cuenta</h2>
      <p>
        Frases como "tienes toda la razón, fue un fallo nuestro" suenan
        empáticas, pero en determinados sectores (sanidad, alimentación,
        servicios regulados) pueden interpretarse como una admisión formal
        de responsabilidad si el asunto llega más lejos.
      </p>
      <p>
        <strong>Mejor:</strong> mostrar empatía por la experiencia del
        cliente sin firmar, de facto, una confesión. "Sentimos que tu
        experiencia no fuera la que esperábamos" reconoce el sentimiento sin
        admitir un hecho legal concreto.
      </p>

      <h2>3. Prometer algo que luego no se cumple</h2>
      <p>
        "Te haremos un descuento en tu próxima visita" suena bien en el
        momento — hasta que el cliente vuelve, nadie en el mostrador sabe
        de qué descuento habla, y la situación se repite peor que la
        primera vez.
      </p>
      <p>
        <strong>Mejor:</strong> no prometer nada que no esté ya decidido y
        comunicado internamente. Invitar a "contactarnos directamente" para
        resolverlo es más seguro que inventar una compensación sobre la
        marcha.
      </p>

      <h2>4. Inventar datos de contacto</h2>
      <p>
        Esto es más común de lo que parece, sobre todo si se usa IA sin
        supervisión: la respuesta incluye un email o teléfono que suena
        plausible ("reservas@turestaurante.com") pero que en realidad no
        existe. Si un cliente frustrado intenta usarlo y rebota, la
        situación empeora en vez de mejorar.
      </p>
      <p>
        <strong>Mejor:</strong> usar solo canales de contacto reales que el
        negocio de verdad gestione, o frases genéricas tipo "escríbenos
        directamente a través de nuestro perfil" cuando no haya un dato
        concreto que dar.
      </p>

      <h2>5. Usar la misma plantilla en todas las respuestas</h2>
      <p>
        "Lamentamos las molestias, su opinión es muy importante para
        nosotros" repetido en la reseña número 15 no transmite atención —
        transmite lo contrario: que nadie ha leído realmente lo que dijo el
        cliente.
      </p>
      <p>
        <strong>Mejor:</strong> cada respuesta debería mencionar algo
        concreto de esa reseña en particular. No hace falta reinventar la
        estructura cada vez, pero sí el contenido específico.
      </p>

      <h2>El patrón detrás de estos 5 errores</h2>
      <p>
        Casi todos vienen de la misma raíz: responder con prisa, sin
        pensar, porque no hay tiempo para hacerlo bien cada vez. La
        solución no es "tener más cuidado" en abstracto — es tener una
        forma de generar respuestas cuidadas sin que cada una te cueste
        diez minutos de reflexión. Eso es, literalmente, para lo que existe
        ReplyAI.
      </p>
    </ArticleLayout>
  );
}
