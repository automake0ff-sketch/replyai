import { NextRequest } from "next/server";

// Mitigación de CSRF para rutas POST que dependen de la cookie de sesión.
// Sin esto, una web maliciosa podría intentar disparar un fetch/formulario
// contra estas rutas y el navegador adjuntaría la cookie de sesión del
// usuario si visitó nuestra app.
//
// Comparamos la cabecera Origin (y, si no viene, Referer como respaldo)
// contra el origen de la PROPIA petición entrante (`req.nextUrl.origin`,
// derivado de la cabecera Host) — NO contra una variable de entorno
// (NEXT_PUBLIC_APP_URL). Comparar contra una env var era frágil: si no
// estaba puesta, o no coincidía exactamente (con/sin "www", http vs
// https, una URL de preview de Vercel distinta a la de producción),
// rechazaba peticiones legítimas de la propia app — esto rompió la demo
// pública en producción. Usando el origen de la petición misma, "mismo
// origen" siempre significa lo correcto sin depender de configuración
// manual, y una petición cross-site real sigue siendo rechazada porque
// su Origin nunca coincidirá con el Host al que realmente está llegando.
export function isSameOrigin(req: NextRequest): boolean {
  const expectedOrigin = req.nextUrl.origin;

  const origin = req.headers.get("origin");
  if (origin) return origin === expectedOrigin;

  // Algunos clientes no mandan Origin en same-origin (poco común pero
  // posible); usamos Referer como respaldo antes de rechazar.
  const referer = req.headers.get("referer");
  if (referer) return referer.startsWith(expectedOrigin);

  return false;
}

