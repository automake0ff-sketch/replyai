# ReplyAI — MVP Blueprint (lanzamiento en 7 días)

## 0. Decisión de equipo (resumen ejecutivo)

Producto: generador de respuestas a reseñas de Google con IA. El valor está en 1 cosa: pegar reseña → sacar 5 respuestas buenas → copiar. Todo lo demás es fricción o gasto de tiempo de dev. Cortamos sin piedad para salir esta semana.

**No se construye en la v1** (aunque esté en tu lista original):
- Google Login → solo email/password (Supabase Auth magic link). OAuth de Google añade config, pantallas de consentimiento, revisión de app. Cuesta 1 día, aporta 0€ de MRR.
- Panel admin con "ingresos estimados" → una query SQL que corres tú en Supabase. No construyas UI para algo que miras 1 vez por semana.
- Plan Agencia multiempresa → v1 vende Free/Pro. Agencia se activa cuando el primer cliente lo pida.
- Landing con FAQ/casos de uso extensos → 1 landing de 1 sola página, secciones mínimas que convierten.

Esto no es "quitar calidad", es no construir lo que no vende en semana 1.

---

## 1. Stack final (sin cambios respecto al tuyo, con matices)

- **Frontend + Backend**: Next.js 14 (App Router), todo en un repo, API routes para IA y Stripe webhooks.
- **DB + Auth**: Supabase (Postgres + Auth con email/password, magic link opcional).
- **IA**: OpenRouter, modelo recomendado `anthropic/claude-3.5-haiku` o `openai/gpt-4o-mini` (barato, rápido, calidad suficiente para copy corto). No uses un modelo caro aquí, el margen se come el modelo.
- **Pagos**: Stripe Checkout + Customer Portal (no construyas tu propio flujo de facturación, usa el Portal de Stripe para cancelaciones/cambios de plan).
- **Hosting**: Vercel.
- **Estilo UI**: Tailwind + shadcn/ui. Look Stripe/Linear se consigue con: mucho espacio en blanco, tipografía Inter, bordes sutiles (1px, gris muy claro), sombras casi imperceptibles, un solo color de acento.

---

## 2. Arquitectura

```
Usuario → Next.js (Vercel)
            ├─ /app (UI: landing, dashboard, generador)
            ├─ /api/generate      → llama OpenRouter, descuenta crédito
            ├─ /api/stripe/checkout
            ├─ /api/stripe/webhook → actualiza plan/créditos en Supabase
            └─ Supabase client (auth + queries)

Supabase
  ├─ auth.users (gestionado por Supabase)
  ├─ profiles       (plan, créditos, negocio)
  ├─ generations     (histórico de respuestas)
  └─ RLS activado en todas las tablas (cada user solo ve sus filas)
```

Flujo de crédito: cada llamada a `/api/generate` es una transacción atómica en Postgres (función RPC) que: comprueba créditos > 0 → genera → descuenta 1 crédito → inserta en `generations`. Si el plan es ilimitado, se salta el check.

---

## 3. Estructura de carpetas

```
replyai/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                 # landing
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                # sidebar + guard de sesión
│   │   ├── dashboard/page.tsx
│   │   ├── generator/page.tsx
│   │   └── settings/page.tsx         # plan, billing portal link
│   ├── api/
│   │   ├── generate/route.ts
│   │   └── stripe/
│   │       ├── checkout/route.ts
│   │       └── webhook/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                           # shadcn
│   ├── generator/
│   │   ├── BusinessTypeSelect.tsx
│   │   ├── ReviewInput.tsx
│   │   └── ResponseCard.tsx          # con botón copiar
│   └── dashboard/
│       ├── CreditsWidget.tsx
│       └── StatsWidget.tsx
├── lib/
│   ├── supabase/ (client.ts, server.ts, middleware.ts)
│   ├── openrouter.ts
│   ├── prompts.ts                    # los 5 prompts, centralizados
│   └── stripe.ts
├── supabase/
│   └── migrations/0001_init.sql
└── middleware.ts                     # protege rutas /app/(app)/*
```

---

## 4. Base de datos (SQL, Supabase)

```sql
-- profiles: 1 fila por usuario, se crea con un trigger al registrarse
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  business_name text,
  business_type text,
  plan text not null default 'free' check (plan in ('free','pro','agency')),
  credits_remaining int not null default 20,
  credits_limit int not null default 20,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  business_type text not null,
  review_text text not null,
  review_sentiment text, -- 'positive' | 'negative' | 'neutral'
  responses jsonb not null, -- { professional, friendly, premium, seo_local, negative }
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table generations enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id);

create policy "own generations" on generations
  for all using (auth.uid() = user_id);

-- trigger: crear profile automáticamente al registrarse
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- función atómica de descuento de crédito
create function consume_credit(p_user_id uuid)
returns boolean as $$
declare
  v_plan text;
  v_credits int;
begin
  select plan, credits_remaining into v_plan, v_credits
  from profiles where id = p_user_id for update;

  if v_plan in ('pro','agency') then
    return true; -- ilimitado
  end if;

  if v_credits <= 0 then
    return false;
  end if;

  update profiles set credits_remaining = credits_remaining - 1 where id = p_user_id;
  return true;
end;
$$ language plpgsql security definer;
```

---

## 5. Generador — UX del flujo único

1. Selector de tipo de negocio (dropdown con los 6 + "Otro").
2. Textarea reseña del cliente.
3. Toggle o auto-detección: ¿es positiva o negativa? (mejor: detectarlo tú con la IA en el mismo prompt, no pidas al usuario que lo marque — menos fricción).
4. Botón "Generar respuestas" → loading state con skeleton de 5 cards.
5. 5 `ResponseCard`: título del tono, texto generado, botón "Copiar" (icono + feedback "¡Copiado!" 1.5s).

Diseño de card: fondo blanco, borde `1px solid #eee`, radius 12px, sombra `0 1px 3px rgba(0,0,0,0.04)`, badge de color por tono (azul=profesional, verde=cercana, morado=premium, naranja=SEO, rojo=negativa).

---

## 6. Prompts IA (lib/prompts.ts)

Principio común a todos: nunca sonar a plantilla genérica, nunca empezar con "Estimado/a", variar estructura de frase, usar el nombre del negocio si se aporta, response corta (40-90 palabras), sin emojis salvo que el negocio sea muy informal.

**System prompt base** (compartido):
```
Eres un experto en atención al cliente y reputación online para negocios locales.
Escribes respuestas a reseñas de Google que suenan 100% humanas, cálidas y
específicas — nunca genéricas ni robóticas. Evitas frases hechas como
"lamentamos las molestias" o "su opinión es muy importante para nosotros".
Escribes en español de España, tono natural, sin emojis excesivos.
Nunca repites literalmente lo que dijo el cliente, lo parafraseas.
Nunca prometas nada que el negocio no pueda garantizar (reembolsos, descuentos)
salvo que el usuario lo indique explícitamente.
```

**1. Profesional** — formal, correcta, orientada a mostrar seriedad del negocio. Agradece, menciona brevemente algo concreto de la reseña, cierra invitando a volver sin ser insistente.

**2. Cercana** — tono de trato directo, como si el dueño respondiera personalmente. Más calidez, puede usar el nombre del cliente si aparece, frase más corta y humana.

**3. Premium** — para negocios de gama alta (hoteles, clínicas, inmobiliarias de lujo). Vocabulario cuidado, transmite exclusividad y atención al detalle, sin sonar pomposo.

**4. SEO Local** — igual de natural que las anteriores pero integra de forma orgánica: nombre del negocio + ciudad/zona + 1-2 términos de servicio relevantes. Nunca debe leerse como keyword-stuffing; la naturalidad manda sobre el SEO.

**5. Reseña negativa** (se genera solo si la reseña es negativa/neutra, sustituye o se suma a las anteriores):
```
Instrucción adicional: la reseña es negativa. Responde con empatía real,
reconoce el problema sin admitir culpa legal ni negar la experiencia del
cliente, evita cualquier tono defensivo o de confrontación, ofrece un canal
privado para resolverlo (teléfono/email genérico "contáctanos directamente"),
y cierra transmitiendo que el negocio mejora a partir de este feedback.
Nunca uses la palabra "lamentamos" más de una vez. Nunca culpes al cliente.
```

Formato de salida pedido al modelo: JSON estricto `{ "sentiment": "...", "professional": "...", "friendly": "...", "premium": "...", "seo_local": "...", "negative": "..." }` (negative solo si sentiment != positive). Esto te permite renderizar directo sin parseo frágil.

---

## 7. Sistema de créditos y planes

| Plan | Precio | Créditos/mes | Multiempresa |
|---|---|---|---|
| Free | 0€ | 20 | No |
| Pro | 19€/mes | Ilimitado | No |
| Agencia | 49€/mes | Ilimitado | Sí (post-launch) |

Reset de créditos Free: cron job (Vercel Cron, 1 vez al día) que resetea `credits_remaining = credits_limit` a usuarios `plan='free'` cuyo `created_at` cumple 1 mes desde el último reset. Para v1, más simple: reset el día 1 de cada mes natural para todos los Free. Menos preciso, cero complejidad.

---

## 8. Stripe

- Checkout: `/api/stripe/checkout` crea sesión con `price_id` según plan elegido, `success_url` al dashboard.
- Webhook `/api/stripe/webhook` escucha `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → actualiza `plan` y `stripe_subscription_id` en `profiles`.
- Cancelaciones/upgrades: no construyas UI propia, enlaza a Stripe Customer Portal desde `/settings`.
- Importante: verifica firma del webhook (`stripe.webhooks.constructEvent`) — es el error de seguridad más común en integraciones rápidas.

---

## 9. Landing page (1 sola página, secciones mínimas)

1. **Hero**: titular orientado a resultado ("Responde a tus reseñas de Google en 10 segundos, no en 10 minutos"), subtítulo, CTA "Prueba gratis" (sin tarjeta).
2. **Problema/beneficio en 3 bullets**: reputación, tiempo, SEO local — sin párrafos largos.
3. **Cómo funciona**: 3 pasos con iconos (elige negocio → pega reseña → copia respuesta).
4. **Demo en vivo o screenshot** del generador con 1 ejemplo real.
5. **Precios**: las 2 cards (Free/Pro), Agencia se puede omitir de la landing en v1 o dejarla como "próximamente".
6. **CTA final** + footer mínimo.

Sin FAQ extenso, sin casos de uso separados — intégralo como microcopy en el hero ("Restaurantes, clínicas, hoteles, inmobiliarias...").

---

## 10. Plan de despliegue

1. Repo en GitHub → conectar a Vercel (deploy automático en push a `main`).
2. Proyecto Supabase → correr migración SQL → copiar `URL` + `anon key` + `service_role key` a env vars de Vercel.
3. OpenRouter: crear API key, límite de gasto diario configurado desde el propio dashboard de OpenRouter (protección anti-abuso).
4. Stripe: modo test → crear productos Pro/Agencia → probar checkout end-to-end → pasar a modo live solo el día de lanzamiento.
5. Dominio propio en Vercel (aunque sea `.app` barato) — un `.vercel.app` resta credibilidad para vender un SaaS de pago.

---

## 11. Checklist de lanzamiento

- [ ] Auth funciona (registro, login, logout, sesión persiste)
- [ ] Trigger crea `profiles` al registrarse
- [ ] Generador devuelve las 5 respuestas en <8s
- [ ] Créditos se descuentan correctamente y bloquean al llegar a 0
- [ ] Checkout Stripe funciona en modo live con tarjeta real (prueba con importe mínimo)
- [ ] Webhook actualiza el plan sin intervención manual
- [ ] Botón copiar funciona en móvil (no solo desktop)
- [ ] RLS probado: un usuario no puede ver `generations` de otro
- [ ] Landing responsive en móvil (la mayoría del tráfico de anuncios locales es móvil)
- [ ] Página de precios con enlace de pago directo (no solo "contactar")
- [ ] Rate limit básico en `/api/generate` (evitar que un usuario reviente tu cuota de OpenRouter)

---

## 12. Errores críticos a evitar

- **No pongas la API key de OpenRouter en el frontend.** Solo en `/api/generate`, server-side.
- **No confíes en el frontend para el conteo de créditos.** Todo el control va en la función SQL `consume_credit`, nunca en el cliente.
- **No process.env sin fallback en build de Vercel** — falla el build entero si falta 1 env var. Define todas antes del primer deploy.
- **No dejes el webhook de Stripe sin verificación de firma** — cualquiera podría simular un pago.
- **No sobre-diseñes el onboarding.** Cero tutoriales, cero tooltips — el producto se explica solo con el flujo de 3 pasos.
- **No metas modelo de IA caro** (GPT-4o completo, Claude Opus) para copy de 80 palabras — te come el margen del plan Free.

---

## 13. Qué añadir después del lanzamiento (no antes)

- Login con Google (cuando tengas usuarios pidiéndolo, no antes)
- Plan Agencia con multiempresa real
- Historial de respuestas generadas con filtros/búsqueda
- Integración directa con Google Business Profile (responder desde ReplyAI sin copiar/pegar) — esto es la feature que justifica subir precio, pero es semanas de trabajo (OAuth de Google Business Profile API), no días
- Panel admin visual (ahora mismo: queries SQL directas en Supabase Studio)
- Idiomas adicionales (inglés primero si vendes fuera de España)
- Webhooks/Zapier para agencias

---

## 14. Roadmap 30 días

**Días 1-2**: Setup repo, Supabase, Auth, schema, deploy inicial en Vercel (esqueleto funcionando en producción desde el día 1).
**Días 3-4**: Generador funcional end-to-end (UI + API + prompts) sin sistema de créditos aún (todo ilimitado en dev).
**Día 5**: Sistema de créditos + planes en DB + Stripe Checkout en modo test.
**Día 6**: Landing page completa + pulido visual del dashboard/generador.
**Día 7**: Stripe en modo live, dominio, checklist de lanzamiento, primeras ventas manuales (contacta 20 negocios locales en Sevilla directamente, no esperes a SEO/ads).
**Semana 2**: Feedback de los primeros 10-20 usuarios reales → arreglar fricciones del flujo de pago/generación, no features nuevas.
**Semana 3**: Primera iteración de precio/paquetes si el Free se usa mucho y el Pro no convierte (ajustar límite de créditos Free, probablemente bajar de 20 a 10-15).
**Semana 4**: Empezar Google Business Profile integration o Login con Google, lo que más pidan los usuarios reales — decide con datos, no con la lista original.

---

**Nota final del equipo**: el mayor riesgo de este proyecto no es técnico, es de distribución. El producto se construye en 5-7 días con este blueprint sin sorpresas. Lo que decide si factura o no es que consigas 20-30 negocios locales probándolo la primera semana — reserva tiempo para eso, no solo para código.
