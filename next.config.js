/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cabeceras de seguridad de defensa en profundidad (hallazgo de
  // auditoría, severidad media). Vercel ya añade algunas protecciones
  // por defecto, pero no una CSP propia — hoy no hay ningún XSS conocido
  // en el código (no se usa dangerouslySetInnerHTML en ningún sitio),
  // esto es para que un fallo futuro tenga menos impacto, no un parche
  // de un problema encontrado.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // La Content-Security-Policy se movió a middleware.ts: necesita
          // un nonce distinto en cada request para permitir los scripts
          // de hidratación de Next sin usar 'unsafe-inline' en script-src.
        ],
      },
    ];
  },
};

module.exports = nextConfig;
