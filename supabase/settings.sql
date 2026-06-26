-- settings.sql — Configurações da organização
-- Aplicar após schema.sql + schema_rls.sql:
--   psql $DATABASE_URL -f supabase/settings.sql
-- Ou no Supabase Dashboard → SQL Editor.

create table if not exists app_settings (
  key   text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

-- Apenas admin lê e escreve configurações
create policy app_settings_admin on app_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed inicial com valores padrão (ignora se já existir)
insert into app_settings (key, value) values
  ('org_name',  'NexisX'),
  ('org_email', ''),
  ('org_url',   '')
on conflict (key) do nothing;
