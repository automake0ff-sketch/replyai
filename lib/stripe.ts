import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Pro",
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    name: "Agencia",
  },
} as const;
