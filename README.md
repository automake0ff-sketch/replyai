# ReplyAI

MVP funcional: genera respuestas a reseñas de Google con IA. Next.js 14 + Supabase + OpenRouter + Stripe.

## Setup (10 min)

```bash
npm install
cp .env.example .env.local
```

### 1. Supabase
1. Crea proyecto en supabase.com
2. Ve a SQL Editor → pega y ejecuta, en orden: `0001_init.sql`, `0002_fix_profile_rls.sql`, `0003_demo_requests.sql`, `0004_harden_security_definer.sql`, `0005_update_business_name.sql`, `0006_api_tokens.sql`, `0007_brand_voice.sql`, `0008_fix_pgcrypto_search_path.sql`, `0009_autotone_review_link.sql`
3. Copia `Project URL`, `anon key` y `service_role key` a `.env.local`

### 2. OpenRouter
1. Crea cuenta en openrouter.ai → genera API key
2. Configura límite de gasto diario (protección anti-abuso)
3. Pégala en `OPENROUTER_API_KEY`

### 3. Stripe
1. Modo test → crea 2 productos recurrentes: "Pro" (19€/mes) y "Agencia" (49€/mes)
2. Copia los `price_id` a `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY`
3. Copia tu clave secreta a `STRIPE_SECRET_KEY`
4. Webhook local: `stripe listen --forward-to localhost:3000/api/stripe/webhook` → copia el signing secret a `STRIPE_WEBHOOK_SECRET`

### 4. Login con Google
1. Ve a [Google Cloud Console](https://console.cloud.google.com) → crea un proyecto (o usa uno existente) → APIs y servicios → Pantalla de consentimiento OAuth (configúrala en modo "Externo", solo necesitas nombre y email de soporte)
2. Credenciales → Crear credenciales → ID de cliente de OAuth → tipo "Aplicación web"
3. En Supabase → Authentication → Providers → Google → copia la "Callback URL (for OAuth)" que te muestra Supabase ahí mismo
4. Pega esa URL en Google Cloud, en "URIs de redirección autorizados" de las credenciales que acabas de crear
5. Copia el "Client ID" y "Client Secret" que te da Google → pégalos en Supabase, en esa misma pantalla de Google Provider → Guardar
6. Activa el toggle "Enable Google provider" en Supabase

No hace falta ninguna variable de entorno nueva en Vercel para esto — toda la configuración vive en Supabase.

### 5. Resend (informe mensual + avisos de créditos bajos)
1. Crea cuenta gratis en resend.com (100 emails/día, 3000/mes gratis)
2. Genera una API key → pégala en `RESEND_API_KEY`
3. Sin verificar dominio propio, los emails salen de `onboarding@resend.dev` — funciona para probar, pero para producción real verifica tu dominio en resend.com/domains y cambia el `from` en `lib/email.ts`

### 6. Arrancar
```bash
npm run dev
```

## Deploy (Vercel)
1. Push a GitHub → importar en Vercel
2. Añadir todas las env vars de `.env.example` en el proyecto de Vercel (con valores de producción, Stripe en modo live)
3. En Stripe Dashboard (modo live) → Webhooks → añadir endpoint `https://tu-dominio.com/api/stripe/webhook`, evento mínimo: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copiar el nuevo `STRIPE_WEBHOOK_SECRET` de producción a Vercel

## Reset mensual de créditos Free
Ya incluido: `vercel.json` configura un Vercel Cron que llama a `/api/cron/reset-credits` el día 1 de cada mes a las 00:00 UTC. Solo necesitas generar un valor para `CRON_SECRET` en tus env vars (ej. `openssl rand -hex 32`) — Vercel lo añade automáticamente como cabecera al llamar la ruta.

## Estructura
Ver `ReplyAI-MVP-Blueprint.md` para arquitectura completa, prompts, checklist de lanzamiento y roadmap de 30 días.
