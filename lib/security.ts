import { NextRequest } from "next/server";

// Mitigación de CSRF para rutas POST que dependen de la cookie de sesión.
// Sin esto, una web maliciosa podría intentar disparar un fetch/formulario
// contra estas rutas y el navegador adjuntaría la cookie de sesión del
// usuario si visitó nuestra app. Comparamos la cabecera Origin (y, si no
// viene, Referer como respaldo) contra nuestro propio dominio — un
// navegador siempre manda Origin en peticiones POST cross-origin y
// same-origin por fetch, así que esto es fiable para bloquear el caso
// cross-site sin necesitar un token CSRF completo con más plumbing.
export function isSameOrigin(req: NextRequest): boolean {
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowedOrigin) return false; // sin origen configurado, no arriesgamos

  const origin = req.headers.get("origin");
  if (origin) return origin === allowedOrigin;

  // Algunos clientes no mandan Origin en same-origin (poco común pero
  // posible); usamos Referer como respaldo antes de rechazar.
  const referer = req.headers.get("referer");
  if (referer) return referer.startsWith(allowedOrigin);

  return false;
}
