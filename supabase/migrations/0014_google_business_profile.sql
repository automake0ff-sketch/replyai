-- Conexión con Google Business Profile: guarda los tokens OAuth de la
-- ubicación de negocio conectada, para poder publicar respuestas
-- directamente sin que el usuario tenga que copiar/pegar en Google.
--
-- Mismo criterio de seguridad que api_tokens (migración 0006): RLS
-- activado sin policies para 'authenticated' — nadie lee los tokens
-- directamente ni con su propia sesión. Todo pasa por:
--   a) las rutas de servidor /api/gbp/* usando el cliente service_role
--      (son las únicas que de verdad necesitan el access_token/refresh_token
--      para hablar con la API de Google), o
--   b) las funciones SECURITY DEFINER de abajo, para lo que sí necesita
--      ver el usuario desde el navegador (si está conectado, a qué
--      ubicación, y desconectar) sin exponer los tokens en sí.

create table if not exists gbp_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  google_account_id text not null,
  google_location_id text not null,
  google_location_name text,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  connected_at timestamptz default now()
);

alter table gbp_connections enable row level security;

-- Estado visible desde Ajustes: conectado o no, y a qué ubicación,
-- SIN exponer los tokens.
create or replace function public.get_gbp_connection_status()
returns table (connected boolean, location_name text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
    select true, c.google_location_name
    from public.gbp_connections c
    where c.user_id = auth.uid();

  if not found then
    return query select false, null::text;
  end if;
end;
$$;

-- Desconectar borra la fila. La revocación del token en el lado de
-- Google (para que deje de aparecer como "app conectada" en su cuenta)
-- se hace en la ruta /api/gbp/disconnect ANTES de llamar a esto, porque
-- necesita el access_token que esta función a propósito no expone.
create or replace function public.disconnect_gbp()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.gbp_connections where user_id = auth.uid();
end;
$$;
