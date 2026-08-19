import type { Metadata } from "next";
import ArticleLayout from "../ArticleLayout";

export const metadata: Metadata = {
  title: "Cómo conseguir más reseñas de Google para tu negocio (guía práctica) — ReplyAI",
  description:
    "El truco no es pedir reseñas mejor, es pedirlas en el momento correcto y quitar toda la fricción posible. Guía práctica con lo que funciona de verdad.",
};

export default function Article() {
  return (
    <ArticleLayout
      title="Cómo conseguir más reseñas de Google para tu negocio"
      subtitle="El truco no es pedir reseñas mejor, es pedirlas en el momento correcto y quitar toda la fricción posible."
    >
      <p>
        La mayoría de negocios locales tienen el mismo problema: clientes
        contentos que jamás dejan una reseña, no porque no quieran, sino
        porque nadie se lo pide en el momento adecuado, o porque el proceso
        tiene demasiados pasos. Esto es lo que de verdad mueve la aguja,
        ordenado de más a menos impacto.
      </p>

      <h2>1. Pide la reseña en el momento de mayor satisfacción, no después</h2>
      <p>
        El error más común es pedir la reseña por email dos días después,
        cuando el cliente ya se ha olvidado de la experiencia. El momento
        con más conversión es <strong>justo cuando el cliente está
        satisfecho</strong>: al pagar en el restaurante, al recoger el
        coche en el taller, al salir de la peluquería. Cuanto más se
        alarga el tiempo entre la experiencia y la petición, menos
        reseñas consigues.
      </p>

      <h2>2. Quita fricción: cuantos menos pasos, más conversión</h2>
      <p>
        Pedir "escríbenos una reseña en Google, busca nuestro negocio,
        entra en la ficha, pulsa en reseñas..." pierde a la mayoría de
        gente por el camino. Cada paso extra es gente que abandona antes
        de terminar. La solución es un enlace directo que abra ya la
        ventana de "escribir reseña" — sin buscar nada.
      </p>
      <p>
        Ese enlace lo encuentras en Google Business Profile → Compartir
        perfil, o buscando tu negocio en Google Maps → "Escribir una
        reseña" → copiar el enlace. Con eso ya puedes generar un QR que
        lleve directo ahí, o mandarlo por WhatsApp tras la visita.
      </p>

      <h2>3. Ponlo físicamente donde está el cliente satisfecho</h2>
      <p>
        Un cartel con el enlace escrito no lo escanea nadie — es demasiado
        esfuerzo teclear una URL. Un código QR en la mesa, en el
        mostrador o en el ticket, en cambio, se escanea con la cámara del
        móvil en dos segundos. Y si además añades una tarjeta NFC (esas
        pegatinas que con solo acercar el móvil abren el enlace, sin ni
        siquiera abrir la cámara), la fricción baja todavía más.
      </p>
      <p>
        Es el mismo soporte que se ve en la mayoría de restaurantes hoy en
        día: un cartelito de mesa con QR y NFC, con el nombre del negocio.
        En ReplyAI, dentro de Herramientas → Captación de reseñas, generas
        ese mismo diseño en un clic (con tu QR ya integrado) listo para
        imprimir y meter en un soporte de acrílico de un par de euros.
      </p>

      <h2>4. Pídelo directamente, no lo insinúes</h2>
      <p>
        "Si te ha gustado, nos ayudaría mucho que lo compartieras" convierte
        peor que un pedido directo: <strong>"¿Nos dejas una reseña en
        Google? Nos ayuda muchísimo y solo lleva 20 segundos."</strong> La
        gente responde mejor a instrucciones claras que a insinuaciones.
      </p>

      <h2>5. No compres reseñas ni las incentives con descuentos</h2>
      <p>
        Es tentador ofrecer "10% de descuento por dejar una reseña" —
        pero va contra las políticas de Google (pueden eliminarte las
        reseñas o penalizar la ficha), y las reseñas incentivadas suelen
        notarse: mismo tono, mismo momento, poco detalle. Mejor pocas
        reseñas reales que muchas que huelan a compradas.
      </p>

      <h2>6. Responde a las que ya tienes</h2>
      <p>
        Esto no consigue reseñas nuevas directamente, pero sí las
        multiplica indirectamente: un negocio que responde a sus reseñas
        (buenas y malas) transmite que hay alguien al otro lado, lo que
        anima a que el siguiente cliente también se moleste en dejar la
        suya. Un perfil con reseñas sin respuesta se siente abandonado, y
        nadie quiere ser el primero en hablarle a un negocio que no
        contesta — aquí tienes cómo <a href="/blog/como-responder-resena-negativa-google">responder bien a una reseña negativa</a> y qué <a href="/blog/errores-responder-resenas-negativas">errores evitar</a>.
      </p>

      <h2>La combinación que funciona</h2>
      <p>
        Ningún truco aislado hace magia. Lo que funciona es la suma:
        pedirlo en el momento correcto, con el mínimo de fricción posible
        (QR/NFC a mano), y mantener respondidas las reseñas que ya
        tienes para que el perfil se vea activo. Ninguna de las tres
        partes sustituye a las otras dos.
      </p>
    </ArticleLayout>
  );
}
