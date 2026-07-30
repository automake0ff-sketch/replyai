-- Fix: pgcrypto se instala en Supabase dentro del esquema "extensions",
-- no en "public". Las funciones que llaman a gen_random_bytes()/digest()
-- (de 0006_api_tokens.sql) tenían `search_path = public, pg_temp`, que
-- no incluye ese esquema, y fallaban con "function gen_random_bytes
-- does not exist". Se añade "extensions" al search_path — es inofensivo
-- si en tu proyecto pgcrypto ya estuviera en "public" (Postgres busca en
-- ambos esquemas sin problema).

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
