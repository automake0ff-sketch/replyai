import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
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
  title: "ReplyAI — Respuestas a reseñas de Google en segundos",
  description:
    "Genera respuestas profesionales a tus reseñas de Google con IA. Protege tu reputación, ahorra tiempo, mejora tu SEO local.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
