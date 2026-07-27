-- Hardening: las funciones SECURITY DEFINER se ejecutan con los
-- privilegios de su propietario (normalmente un rol con permisos
-- elevados), no del usuario que las invoca. Sin un `search_path` fijo,
-- un usuario autenticado podría crear un objeto (tabla/función) en un
-- esquema que aparezca antes en su propio search_path y hacer que la
-- función SECURITY DEFINER opere sobre ese objeto suplantado en vez del
-- real (esquema "public"). Se fija `search_path = public, pg_temp` y se
-- cualifica cada referencia a tabla con `public.` explícitamente.

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
