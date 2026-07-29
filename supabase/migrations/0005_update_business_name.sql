-- Permite al usuario actualizar su propio nombre de negocio sin reabrir
-- el permiso de UPDATE completo sobre `profiles` (que se cerró en
-- 0002_fix_profile_rls.sql por motivos de seguridad: un UPDATE genérico
-- permitiría auto-asignarse `plan`/`credits_remaining`). Esta función
-- toca EXCLUSIVAMENTE la columna `business_name`, y usa `auth.uid()`
-- directamente (no un parámetro de id) para que un usuario nunca pueda
-- modificar el perfil de otro.

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
