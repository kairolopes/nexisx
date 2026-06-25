-- =============================================================
-- NexisX — Supabase Storage (buckets privados + policies)
-- Execute APÓS schema.sql e schema_rls.sql.
--
-- Convenção de caminho: o PRIMEIRO segmento de pasta é sempre o child_id, ex.:
--   facial-photos/<child_id>/<uuid>.jpg
-- Assim as policies reaproveitam public.can_access_child() — a mesma regra do RLS
-- das tabelas. Admin/responsável/profissional/escola seguem exatamente o mesmo escopo.
-- =============================================================

-- -------------------------------------------------------------
-- 1) Buckets (privados — public = false)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('facial-photos',   'facial-photos',   false),
  ('genetic-reports', 'genetic-reports', false),
  ('child-documents', 'child-documents', false)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- 2) Helper: extrai o child_id (1º segmento) do nome do objeto.
--    Retorna null se o caminho não começar por um UUID válido.
-- -------------------------------------------------------------
create or replace function public.storage_child_id(object_name text)
returns uuid language plpgsql immutable as $$
declare
  first_seg text;
begin
  first_seg := (storage.foldername(object_name))[1];
  if first_seg is null then
    return null;
  end if;
  return first_seg::uuid;
exception when others then
  return null;  -- caminho fora do padrão → sem acesso
end $$;

-- -------------------------------------------------------------
-- 3) Policies por bucket (select/insert/update/delete) — todas
--    delegam a public.can_access_child(). RLS já está habilitado
--    em storage.objects por padrão no Supabase.
-- -------------------------------------------------------------
do $$
declare
  b text;
  buckets text[] := array['facial-photos','genetic-reports','child-documents'];
begin
  foreach b in array buckets loop
    -- leitura
    execute format($f$
      create policy %1$L on storage.objects for select
      using (
        bucket_id = %2$L
        and public.storage_child_id(name) is not null
        and public.can_access_child(public.storage_child_id(name))
      );$f$, b || '_select', b);

    -- upload
    execute format($f$
      create policy %1$L on storage.objects for insert
      with check (
        bucket_id = %2$L
        and public.storage_child_id(name) is not null
        and public.can_access_child(public.storage_child_id(name))
      );$f$, b || '_insert', b);

    -- atualização
    execute format($f$
      create policy %1$L on storage.objects for update
      using (
        bucket_id = %2$L
        and public.can_access_child(public.storage_child_id(name))
      );$f$, b || '_update', b);

    -- exclusão
    execute format($f$
      create policy %1$L on storage.objects for delete
      using (
        bucket_id = %2$L
        and public.can_access_child(public.storage_child_id(name))
      );$f$, b || '_delete', b);
  end loop;
end $$;
