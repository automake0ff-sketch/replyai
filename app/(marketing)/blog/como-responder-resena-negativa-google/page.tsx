import type { Metadata } from "next";
import ArticleLayout from "../ArticleLayout";

export const metadata: Metadata = {
  title: "Cómo responder a una reseña negativa en Google (con ejemplos) — ReplyAI",
  description:
    "Guía práctica para responder reseñas negativas en Google sin sonar defensivo ni robótico, con ejemplos reales de qué decir y qué evitar.",
};

export default function Article() {
  return (
    <ArticleLayout
      title="Cómo responder a una reseña negativa en Google (con ejemplos)"
      subtitle="La reseña de 2 estrellas no tiene por qué ser un desastre. Con la respuesta correcta, puede convertirse en la prueba de que tu negocio se toma en serio a sus clientes."
    >
      <p>
        Casi todos los negocios locales tienen la misma reacción la primera
        vez que ven una reseña de 1 o 2 estrellas: el estómago se encoge.
        Es normal — has puesto trabajo, dinero y cariño en tu negocio, y de
        repente alguien lo cuenta en público de la peor manera posible.
      </p>
      <p>
        Pero aquí va algo que cambia la perspectiva: <strong>la reseña
        negativa no la lee solo el cliente que la escribió</strong>. La lee
        también cualquiera que esté decidiendo si confiar en ti o no. Y lo
        que más pesa en esa decisión no es que exista una reseña mala —
        eso pasa en cualquier negocio real — sino <strong>cómo respondiste</strong>.
      </p>

      <h2>Lo que nunca debes hacer</h2>
      <ul>
        <li>
          <strong>Ponerte a la defensiva.</strong> Frases como "eso no es
          cierto" o "usted no entendió el proceso" confirman ante cualquiera
          que lo lea que el negocio no sabe encajar una crítica.
        </li>
        <li>
          <strong>Ignorarla.</strong> Una reseña de 2 estrellas sin respuesta,
          meses después, sigue ahí — silenciosa, pero visible para todo el
          que llegue después.
        </li>
        <li>
          <strong>Copiar la misma plantilla siempre.</strong> "Lamentamos las
          molestias, su opinión es muy importante para nosotros" repetido en
          10 reseñas distintas no transmite atención — transmite lo
          contrario.
        </li>
      </ul>

      <h2>La estructura que sí funciona</h2>
      <p>
        Una buena respuesta a una reseña negativa suele tener tres partes,
        en este orden:
      </p>
      <ol>
        <li>
          <strong>Reconoce lo concreto.</strong> No un genérico "sentimos que
          no haya sido de tu agrado" — menciona qué pasó exactamente (la
          espera, la temperatura del plato, el malentendido con la cita).
        </li>
        <li>
          <strong>Empatía sin admitir culpa legal.</strong> Puedes mostrar
          que entiendes la frustración sin firmar, de facto, una admisión de
          responsabilidad que luego te complique la vida.
        </li>
        <li>
          <strong>Invita a resolverlo en privado</strong> — sin inventarte un
          email o teléfono que luego no exista, y sin prometer compensaciones
          que no estés dispuesto a dar.
        </li>
      </ol>

      <h3>Ejemplo</h3>
      <blockquote>
        "Gracias por contarnos tu experiencia. Sentimos que el tiempo de
        espera y la temperatura de los platos no estuvieran a la altura esa
        noche. Lo tenemos en cuenta para mejorar, y nos encantaría que nos
        dieras otra oportunidad pronto."
      </blockquote>
      <p>
        Nota lo que NO hace esta respuesta: no se disculpa tres veces, no
        inventa un email de contacto, no promete un descuento que nadie
        autorizó, y no suena a que la escribió un abogado.
      </p>

      <h2>¿Y si la reseña es injusta o directamente falsa?</h2>
      <p>
        Pasa. En ese caso, el objetivo cambia ligeramente: no se trata de
        disculparte por algo que no ocurrió, sino de dejar constancia —
        con tono calmado, sin confrontación — de tu versión, para quien lea
        la reseña después. Puedes reportar la reseña a Google si incumple
        sus políticas, pero mientras tanto, una respuesta serena vale más
        que el silencio.
      </p>

      <p>
        Escribir esto bien, reseña tras reseña, cuesta tiempo — que es
        exactamente el problema que resuelve una herramienta como ReplyAI:
        generar la respuesta correcta en segundos, sin que tengas que
        pensarla desde cero cada vez.
      </p>
    </ArticleLayout>
  );
}
