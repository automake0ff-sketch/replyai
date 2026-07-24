-- ReplyAI: schema inicial

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  business_name text,
  business_type text,
  plan text not null default 'free' check (plan in ('free','pro','agency')),
  credits_remaining int not null default 20,
  credits_limit int not null default 20,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  business_type text not null,
  review_text text not null,
  review_sentiment text,
  responses jsonb not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table generations enable row level security;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);

-- Sin política de insert/update/delete para el rol authenticated:
-- toda mutación de `profiles` pasa por funciones SECURITY DEFINER
-- (más abajo) o por el cliente service_role (webhook de Stripe),
-- ambos exentos de RLS. Un usuario NUNCA debe poder escribir su
-- propio `plan` o `credits_remaining` directamente desde el navegador.

create policy "own generations" on generations
  for all using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function consume_credit(p_user_id uuid)
returns boolean as $$
declare
  v_plan text;
  v_credits int;
begin
  select plan, credits_remaining into v_plan, v_credits
  from profiles where id = p_user_id for update;

  if v_plan in ('pro','agency') then
    return true;
  end if;

  if v_credits <= 0 then
    return false;
  end if;

  update profiles set credits_remaining = credits_remaining - 1 where id = p_user_id;
  return true;
end;
$$ language plpgsql security definer;

-- Reset mensual de créditos Free (ejecutar vía Vercel Cron el día 1 de cada mes)
create or replace function reset_free_credits()
returns void as $$
begin
  update profiles
  set credits_remaining = credits_limit
  where plan = 'free';
end;
$$ language plpgsql security definer;
