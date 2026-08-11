-- Baja el límite del plan Free de 20 a 15 respuestas/mes: reduce coste
-- real de IA y acorta el tiempo hasta que un usuario activo tope el
-- límite y considere pasar a Pro, sin eliminar la capa gratuita (que
-- sigue siendo la pieza clave de conversión de la demo y del lanzamiento
-- en Product Hunt).

alter table profiles alter column credits_limit set default 15;
alter table profiles alter column credits_remaining set default 15;

-- Usuarios Free existentes: se ajusta su límite a 15. Si alguno tenía
-- más de 15 créditos restantes en este momento, los conserva hasta el
-- próximo reset mensual (no se le quita nada retroactivamente, solo se
-- corrige el límite de cara adelante).
update profiles
set credits_limit = 15
where plan = 'free' and credits_limit = 20;
