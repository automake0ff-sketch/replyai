-- Sistema de tokens de API para la extensión de Chrome. La extensión no
-- puede usar la cookie de sesión del navegador (vive en otro origen,
-- chrome-extension://), así que necesita su propio esquema de
-- autenticación: un token personal tipo "API key".
--
-- Solo se guarda el HASH del token, nunca el token en claro — igual que
-- una contraseña. El token en claro se devuelve UNA sola vez, en el
-- momento de generarlo, y no se puede recuperar después (si se pierde,
-- se genera uno nuevo, que invalida el anterior).

create extension if not exists pgcrypto;

create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

alter table api_tokens enable row level security;
-- Sin policies para el rol authenticated: ni siquiera el propio usuario
-- puede leer su hash directamente. Toda interacción pasa por las
-- funciones SECURITY DEFINER de abajo, que son las únicas que tocan
-- esta tabla.

-- Genera un token nuevo para el usuario autenticado (auth.uid()).
-- Si ya tenía uno, lo reemplaza (solo un token activo por usuario).
-- Devuelve el token EN CLARO — es la única vez que se puede ver.
create or replace function public.generate_api_token()
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_token text;
  v_hash text;
begin
  v_token := 'rai_' || encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_token, 'sha256'), 'hex');

  delete from public.api_tokens where user_id = auth.uid();

  insert into public.api_tokens (user_id, token_hash)
  values (auth.uid(), v_hash);

  return v_token;
end;
$$;

-- Revoca (borra) el token del usuario autenticado.
create or replace function public.revoke_api_token()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.api_tokens where user_id = auth.uid();
end;
$$;

-- Indica si el usuario autenticado tiene un token activo (sin revelar
-- el hash), para mostrar el estado en la UI de Ajustes.
create or replace function public.has_api_token()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return exists (select 1 from public.api_tokens where user_id = auth.uid());
end;
$$;

-- Resuelve un token EN CLARO (recibido de la extensión) a un user_id.
-- Llamada únicamente desde el servidor con el cliente service_role
-- (nunca hay sesión de usuario en esta ruta, es autenticación por
-- token, no por cookie).
create or replace function public.get_user_id_for_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_hash text;
  v_user_id uuid;
begin
  v_hash := encode(digest(p_token, 'sha256'), 'hex');
  select user_id into v_user_id from public.api_tokens where token_hash = v_hash;

  if v_user_id is not null then
    update public.api_tokens set last_used_at = now() where token_hash = v_hash;
  end if;

  return v_user_id;
end;
$$;
