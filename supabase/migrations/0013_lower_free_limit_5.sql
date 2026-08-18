-- Baja el límite del plan Free de 15 a 5 respuestas/mes: acorta aún más
-- el tiempo hasta tope y empuja antes a la conversión a Pro, manteniendo
-- la capa gratuita (sin tarjeta) como gancho de la landing.

alter table profiles alter column credits_limit set default 5;
alter table profiles alter column credits_remaining set default 5;

-- Usuarios Free existentes: se ajusta su límite a 5. Si alguno tenía más
-- de 5 créditos restantes en este momento, los conserva hasta el próximo
-- reset mensual (no se le quita nada retroactivamente, solo se corrige
-- el límite de cara adelante).
update profiles
set credits_limit = 5
where plan = 'free' and credits_limit = 15;
