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
          {
            key: "Content-Security-Policy",
            // 'unsafe-inline' en style-src es necesario por los estilos
            // inline que genera Next/Tailwind en algunos componentes;
            // script-src no incluye 'unsafe-inline' ni 'unsafe-eval'.
            // connect-src incluye Supabase y OpenRouter porque el cliente
            // del navegador habla directamente con Supabase (auth) y las
            // API routes del propio origen ya cubren 'self'.
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://openrouter.ai",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
