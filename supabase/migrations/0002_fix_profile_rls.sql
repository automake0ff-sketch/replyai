-- Fix crítico de seguridad: la política "own profile" original usaba
-- `for all`, lo que permite a cualquier usuario autenticado hacer UPDATE
-- directo sobre su propia fila de `profiles` vía el cliente de Supabase
-- desde el navegador — incluyendo las columnas `plan` y `credits_remaining`.
-- Esto permite auto-asignarse el plan Pro/Agencia sin pasar por Stripe.
--
-- Con este cambio, los usuarios SOLO pueden leer su perfil (select).
-- La escritura de `plan`, créditos y datos de Stripe queda restringida a:
--   - Las funciones SECURITY DEFINER (consume_credit, handle_new_user,
--     reset_free_credits), que se ejecutan con privilegios elevados y
--     por tanto se saltan RLS igualmente.
--   - El cliente service_role usado en el webhook de Stripe (server-side
--     únicamente, nunca expuesto al navegador), que también ignora RLS.

drop policy if exists "own profile" on profiles;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);

-- Sin política de insert/update/delete para el rol authenticated:
-- ninguna mutación de `profiles` debe originarse desde el navegador.
