-- Fix de seguridad (severidad media, hallazgo de auditoría): la policy
-- "own generations" original usaba `for all`, lo que permite a cualquier
-- usuario autenticado hacer INSERT directo en `generations` desde el
-- navegador (vía el cliente Supabase con la clave anónima, expuesta por
-- diseño) sin pasar por /api/generate — es decir, sin descontar crédito
-- ni pasar por el generador real. El impacto es acotado (solo permite
-- falsear el propio historial, no afecta a otros usuarios ni consume
-- cuota de IA), pero rompe la garantía de que el historial refleja
-- generaciones reales facturadas contra el crédito del usuario.
--
-- Con este cambio, los usuarios SOLO pueden leer (select) sus propias
-- generaciones. La escritura queda restringida a una función
-- SECURITY DEFINER que ellos mismos pueden llamar, pero que valida
-- tamaños igual que ya hace /api/generate en el propio endpoint (defensa
-- en profundidad: aunque alguien se salte la validación de la API route,
-- la función de base de datos aplica los mismos límites).

drop policy if exists "own generations" on generations;

create policy "select own generations" on generations
  for select using (auth.uid() = user_id);

-- Sin policy de insert/update/delete para el rol authenticated: toda
-- escritura pasa por esta función o por el cliente service_role
-- (extensión de Chrome, que ya usa service_role y por tanto se salta RLS
-- igualmente).

create or replace function public.insert_own_generation(
  p_business_type text,
  p_review_text text,
  p_review_sentiment text,
  p_responses jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if p_business_type is null or length(p_business_type) = 0 or length(p_business_type) > 100 then
    raise exception 'Tipo de negocio inválido';
  end if;

  if p_review_text is null or length(p_review_text) < 3 or length(p_review_text) > 2000 then
    raise exception 'Texto de reseña inválido';
  end if;

  if p_review_sentiment is not null and p_review_sentiment not in ('positive', 'negative', 'neutral') then
    raise exception 'Sentimiento inválido';
  end if;

  insert into public.generations (user_id, business_type, review_text, review_sentiment, responses)
  values (auth.uid(), p_business_type, p_review_text, p_review_sentiment, p_responses)
  returning id into v_id;

  return v_id;
end;
$$;
