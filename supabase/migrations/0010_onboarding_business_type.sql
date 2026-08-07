-- Tipo de negocio por defecto, configurado una vez en el onboarding
-- post-registro, para no tener que elegirlo en cada generación. El
-- generador sigue permitiendo cambiarlo puntualmente si hace falta —
-- esto solo evita la fricción de elegirlo siempre desde cero.

alter table profiles add column if not exists default_business_type text;

create or replace function public.update_own_business_profile(
  p_business_name text,
  p_brand_voice_notes text,
  p_default_business_type text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_business_name is not null and length(p_business_name) > 200 then
    raise exception 'Nombre de negocio demasiado largo';
  end if;

  if p_brand_voice_notes is not null and length(p_brand_voice_notes) > 500 then
    raise exception 'Instrucciones de marca demasiado largas';
  end if;

  if p_default_business_type is not null and length(p_default_business_type) > 100 then
    raise exception 'Tipo de negocio demasiado largo';
  end if;

  update public.profiles
  set
    business_name = nullif(trim(p_business_name), ''),
    brand_voice_notes = nullif(trim(p_brand_voice_notes), ''),
    default_business_type = nullif(trim(p_default_business_type), '')
  where id = auth.uid();
end;
$$;
