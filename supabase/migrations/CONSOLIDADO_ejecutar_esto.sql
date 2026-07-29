-- ============================================================
-- SCRIPT CONSOLIDADO — pega esto ENTERO en Supabase SQL Editor
-- y dale a Ejecutar. Es seguro aunque ya hayas corrido antes
-- alguna de las migraciones 0002 a 0006 por separado: está
-- escrito para no fallar si algo ya existe.
-- ============================================================

-- ===== 0002: fix de seguridad en profiles =====
drop policy if exists "own profile" on profiles;
drop policy if exists "select own profile" on profiles;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);

-- ===== 0003: tabla de la demo pública =====
create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  created_at timestamptz default now()
);

create index if not exists demo_requests_ip_created_idx
  on demo_requests (ip_address, created_at);

alter table demo_requests enable row level security;

-- ===== 0004: hardening de funciones SECURITY DEFINER =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create or replace function public.consume_credit(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan text;
  v_credits int;
begin
  select plan, credits_remaining into v_plan, v_credits
  from public.profiles where id = p_user_id for update;

  if v_plan in ('pro','agency') then
    return true;
  end if;

  if v_credits <= 0 then
    return false;
  end if;

  update public.profiles set credits_remaining = credits_remaining - 1 where id = p_user_id;
  return true;
end;
$$;

create or replace function public.reset_free_credits()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profiles
  set credits_remaining = credits_limit
  where plan = 'free';
end;
$$;

-- ===== 0005: nombre del negocio =====
create or replace function public.update_own_business_name(p_business_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_business_name is not null and length(p_business_name) > 200 then
    raise exception 'Nombre de negocio demasiado largo';
  end if;

  update public.profiles
  set business_name = nullif(trim(p_business_name), '')
  where id = auth.uid();
end;
$$;

-- ===== 0006: tokens de API para la extensión de Chrome =====
create extension if not exists pgcrypto;

create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

alter table api_tokens enable row level security;

create or replace function public.generate_api_token()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
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

create or replace function public.get_user_id_for_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
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

-- ============================================================
-- Fin. Si todo salió "Success. No rows returned" (o similar),
-- tu base de datos ya tiene aplicado todo lo construido hasta
-- ahora: RLS segura, historial, nombre de negocio, y tokens
-- de la extensión de Chrome.
-- ============================================================
