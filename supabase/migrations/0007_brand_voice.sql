-- Voz de marca: instrucciones libres del usuario ("firma como Ana",
-- "nunca menciones descuentos", "tono desenfadado"...) que se inyectan
-- en el prompt junto al nombre del negocio. Reemplaza la función
-- update_own_business_name por una que actualiza ambos campos a la vez
-- desde el mismo formulario de Ajustes.

alter table profiles add column if not exists brand_voice_notes text;

create or replace function public.update_own_business_profile(
  p_business_name text,
  p_brand_voice_notes text
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

  update public.profiles
  set
    business_name = nullif(trim(p_business_name), ''),
    brand_voice_notes = nullif(trim(p_brand_voice_notes), '')
  where id = auth.uid();
end;
$$;
