import type { Metadata } from "next";
import ArticleLayout from "../ArticleLayout";

export const metadata: Metadata = {
  title: "Cómo responder reseñas de Google para restaurantes (con ejemplos) — ReplyAI",
  description:
    "Las quejas de un restaurante se repiten siempre: tiempo de espera, temperatura del plato, ruido, precio. Cómo responder a cada una sin sonar defensivo.",
};

export default function Article() {
  return (
    <ArticleLayout
      title="Cómo responder reseñas de Google para restaurantes"
      subtitle="Las quejas de un restaurante se repiten siempre: tiempo de espera, temperatura del plato, ruido, precio. Cómo responder a cada una sin sonar defensivo."
    >
      <p>
        Un restaurante recibe muchas más reseñas que la mayoría de negocios
        locales — cada mesa es un cliente potencial que reseña. Eso es
        una ventaja (más volumen de reputación) y un problema (más tiempo
        necesario para responder a todas). La buena noticia es que las
        quejas de restaurantes se repiten mucho más que en otros sectores,
        así que unas pocas estructuras cubren la mayoría de casos.
      </p>

      <h2>"Tardaron mucho en atendernos / traer la comida"</h2>
      <p>
        Es la queja más común de todas. El error típico es justificarse
        con "estábamos a tope" — suena a excusa, no a solución.
      </p>
      <blockquote>
        "Gracias por contarnos tu experiencia. Sentimos que la espera fuera
        más larga de lo que esperabas — es algo que nos tomamos en serio,
        y estamos trabajando en mejorar los tiempos en las horas de más
        afluencia. Esperamos poder demostrarte una experiencia mejor la
        próxima vez."
      </blockquote>

      <h2>"La comida estaba fría / no como se esperaba"</h2>
      <p>
        Aquí es importante no sonar defensivo con la calidad del plato en
        sí — el objetivo es mostrar que se toma en serio, no debatir si
        tenía razón.
      </p>
      <blockquote>
        "Lamentamos que el plato no llegara en las condiciones que
        esperábamos — no es lo habitual y nos gustaría saber más para
        evitar que se repita. Escríbenos a [contacto] cuando puedas,
        queremos arreglarlo."
      </blockquote>

      <h2>"Muy caro para lo que ofrece"</h2>
      <p>
        Esta es de las más delicadas — discutir el precio en público casi
        nunca sale bien. Mejor reconocer la percepción sin entrar a
        debatir si es justo o no.
      </p>
      <blockquote>
        "Gracias por tu opinión. Entendemos que el precio es una parte
        importante de la decisión, y trabajamos para que cada plato lo
        justifique con calidad e ingredientes. Tomamos nota de tu
        comentario."
      </blockquote>

      <h2>"Mucho ruido / ambiente incómodo"</h2>
      <blockquote>
        "Gracias por el comentario — sabemos que el ambiente puede resultar
        más animado en las horas punta, y queremos que también sea un
        sitio cómodo para una conversación tranquila. Lo tenemos en
        cuenta para seguir ajustándolo."
      </blockquote>

      <h2>Las reseñas de 5 estrellas también importan (y se olvidan)</h2>
      <p>
        Es fácil centrarse solo en las negativas porque "urgen" más, pero
        las de 5 estrellas sin respuesta también transmiten un perfil
        desatendido. No hace falta un ensayo — una línea corta y
        específica basta:
      </p>
      <blockquote>
        "¡Gracias por la visita! Nos alegra mucho que disfrutaras [del
        plato/la terraza/el trato] — te esperamos pronto de nuevo."
      </blockquote>

      <h2>El volumen es el verdadero problema en restauración</h2>
      <p>
        La parte difícil para un restaurante no es saber qué decir en una
        respuesta suelta — es sostenerlo cuando llegan 15-20 reseñas
        nuevas a la semana entre varias plataformas y turnos. Ahí es donde
        la mayoría de restaurantes abandona: no por falta de criterio,
        sino por falta de tiempo en el día a día del servicio. Es
        justo el hueco que cubre generar la respuesta en segundos en vez
        de desde cero cada vez — y para captar más reseñas nuevas sin
        pedir cada vez de palabra, un QR en la mesa capta bastantes más
        (tienes la guía completa en <a href="/blog/como-conseguir-mas-resenas-google">cómo conseguir más reseñas de Google</a>).
      </p>
    </ArticleLayout>
  );
}
