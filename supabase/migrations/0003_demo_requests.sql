-- Tabla para limitar la demo pública (sin login) por IP.
-- Evita que tráfico anónimo agote la cuota diaria del modelo gratuito
-- de OpenRouter, que también usan los usuarios registrados reales.

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz default now()
);

create index if not exists demo_requests_ip_created_idx
  on demo_requests (ip_address, created_at);

-- Sin RLS: esta tabla solo la toca el cliente service_role desde el
-- servidor (nunca se expone al navegador ni se lee desde el frontend).
alter table demo_requests enable row level security;
-- (ninguna policy = nadie con el rol anon/authenticated puede leer ni escribir)
