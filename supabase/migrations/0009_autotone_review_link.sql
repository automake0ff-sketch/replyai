-- Añade:
-- - auto_tone_positive: tono preferido que la extensión usa automáticamente
--   para reseñas de 4-5 estrellas, sin que el usuario tenga que elegir tono
--   cada vez. NO es autopiloto sin supervisión: sigue requiriendo que el
--   usuario haga clic en "Generar" en la extensión y publique él mismo.
-- - review_link: URL de reseña de Google del negocio, para generar un QR
--   de captación ("danos tu opinión").

alter table profiles add column if not exists auto_tone_positive text
  check (auto_tone_positive in ('professional', 'friendly', 'premium', 'seo_local') or auto_tone_positive is null);

alter table profiles add column if not exists review_link text;

create or replace function public.update_own_extras(
  p_auto_tone_positive text,
  p_review_link text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_auto_tone_positive is not null and p_auto_tone_positive not in ('professional', 'friendly', 'premium', 'seo_local') then
    raise exception 'Tono automático no válido';
  end if;

  if p_review_link is not null and length(p_review_link) > 500 then
    raise exception 'Enlace demasiado largo';
  end if;

  update public.profiles
  set
    auto_tone_positive = p_auto_tone_positive,
    review_link = nullif(trim(p_review_link), '')
  where id = auth.uid();
end;
$$;
