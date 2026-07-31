import Stripe from "stripe";

// .trim() defensivo: un espacio o salto de línea colado al copiar la
// clave desde el dashboard de Stripe (algo que pasa con más frecuencia
// de la que parece) puede provocar errores de conexión opacos en vez de
// un error claro de autenticación.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: "2024-06-20",
});

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO?.trim() || "",
    name: "Pro",
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_AGENCY?.trim() || "",
    name: "Agencia",
  },
} as const;
