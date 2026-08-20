import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Public_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "ReplyAI — Respuestas a reseñas de Google en segundos",
  description:
    "Genera respuestas profesionales a tus reseñas de Google con IA. Protege tu reputación, ahorra tiempo, mejora tu SEO local.",
  openGraph: {
    title: "ReplyAI — Respuestas a reseñas de Google en segundos",
    description:
      "Genera respuestas profesionales a tus reseñas de Google con IA.",
    locale: "es_ES",
    type: "website",
  },
  verification: {
    google: "uF_-Vig2l1Cef12aUKDYKiLUpc2ERIWJ3-CjYIP8nh0",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Leer headers() aquí es lo que obliga a renderizar dinámicamente (por
  // request) en vez de servir HTML estático pre-generado en el build. Es
  // necesario para que el nonce que pone el middleware en la CSP coincida
  // con el que Next.js graba en sus propios <script> de hidratación — si
  // esta página se sirve como estática (PRERENDER), esos scripts se
  // graban en build time sin nonce y el navegador los bloquea siempre,
  // aunque el header CSP del request tenga uno válido.
  await headers();

  return (
    <html lang="es" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
