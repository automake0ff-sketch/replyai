import type { Metadata } from "next";
import ArticleLayout from "../ArticleLayout";

export const metadata: Metadata = {
  title: "Plantillas de respuestas a reseñas de Google gratis (positivas y negativas) — ReplyAI",
  description:
    "Plantillas listas para copiar y adaptar a reseñas de Google, positivas y negativas, con la advertencia de por qué copiarlas tal cual no es tan buena idea como parece.",
};

export default function Article() {
  return (
    <ArticleLayout
      title="Plantillas de respuestas a reseñas de Google gratis"
      subtitle="Listas para copiar y adaptar — con la advertencia de por qué copiarlas tal cual no es tan buena idea como parece."
    >
      <p>
        Aquí tienes plantillas reales que puedes adaptar a tu negocio. Antes
        de usarlas, una advertencia honesta: <strong>una plantilla que se
        repite palabra por palabra en todas tus reseñas se nota</strong>, y
        no solo a los clientes — Google también detecta patrones de texto
        repetido. Úsalas como punto de partida, cambia algo en cada
        respuesta (qué mencionó el cliente en concreto, un detalle real),
        no las pegues tal cual.
      </p>

      <h2>Para reseñas de 5 estrellas</h2>
      <blockquote>
        "¡Muchas gracias por tu reseña! Nos alegra mucho saber que
        disfrutaste [de la comida / del servicio / de la experiencia].
        Esperamos verte pronto de nuevo por [nombre del negocio]."
      </blockquote>
      <blockquote>
        "Gracias de corazón por tomarte el tiempo de escribirnos. Comentarios
        como el tuyo son los que nos animan a seguir cuidando cada detalle.
        ¡Hasta la próxima!"
      </blockquote>

      <h2>Para reseñas de 3-4 estrellas (buenas, con algún "pero")</h2>
      <blockquote>
        "Gracias por tu reseña y por el feedback sobre [lo que mencionó].
        Nos alegra que en general la experiencia fuera positiva, y tomamos
        nota de tu comentario para seguir mejorando. ¡Esperamos verte
        pronto!"
      </blockquote>

      <h2>Para reseñas negativas (1-2 estrellas)</h2>
      <p>
        Aquí es donde las plantillas genéricas fallan más — una reseña
        negativa necesita reconocer el problema específico, no una disculpa
        vacía. Aun así, esta estructura funciona como base:
      </p>
      <blockquote>
        "Lamentamos mucho que tu experiencia no fuera la que esperábamos.
        [Reconocer el problema concreto que menciona]. Nos gustaría poder
        arreglarlo — escríbenos a [email/teléfono] y nos encargamos
        personalmente. Gracias por decírnoslo, nos ayuda a mejorar."
      </blockquote>
      <p>
        La clave de esta plantilla no es el texto en sí, es la estructura:
        reconocer sin excusas → ofrecer solución concreta → sacar la
        conversación fuera de la reseña pública. Si quieres profundizar en
        cómo adaptar esto según el tipo de queja, tenemos una guía
        específica sobre <a href="/blog/como-responder-resena-negativa-google">cómo responder a una reseña negativa</a>.
      </p>

      <h2>Por qué las plantillas fijas tienen fecha de caducidad</h2>
      <p>
        El problema real de "guardar 5 plantillas y turnarse" es que con
        el tiempo se repiten frases exactas, y cualquiera que lea varias
        reseñas seguidas de tu negocio lo nota. La alternativa que no
        implica escribir cada respuesta desde cero es generar una
        respuesta distinta cada vez, adaptada al texto concreto de esa
        reseña — que es exactamente lo que hace ReplyAI: pegas la reseña,
        y en segundos tienes 5 tonos distintos ya adaptados a lo que dijo
        ese cliente en particular, no una plantilla genérica.
      </p>
    </ArticleLayout>
  );
}
