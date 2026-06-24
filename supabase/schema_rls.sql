-- =============================================================
-- NexisX — Row Level Security (RLS)
-- Execute APÓS supabase/schema.sql.
--
-- Regras:
--   admin        -> vê e gerencia tudo
--   responsavel  -> apenas seus filhos
--   profissional -> apenas crianças vinculadas (child_professionals)
--   escola       -> apenas crianças autorizadas (child_schools.authorized)
--   consultor    -> solicitações comerciais (salas) e exames
-- =============================================================

-- Habilita RLS em todas as tabelas
alter table profiles               enable row level security;
alter table guardians              enable row level security;
alter table professionals          enable row level security;
alter table schools                enable row level security;
alter table children               enable row level security;
alter table child_professionals    enable row level security;
alter table child_schools          enable row level security;
alter table facial_analyses        enable row level security;
alter table mchat_sessions         enable row level security;
alter table mchat_answers          enable row level security;
alter table screening_reports      enable row level security;
alter table neuro_profiles         enable row level security;
alter table neuro_timeline_events  enable row level security;
alter table tasks                  enable row level security;
alter table task_completions       enable row level security;
alter table games                  enable row level security;
alter table game_sessions          enable row level security;
alter table parent_diary_entries   enable row level security;
alter table professional_notes     enable row level security;
alter table school_notes           enable row level security;
alter table evolution_reports      enable row level security;
alter table sensory_room_requests  enable row level security;
alter table genetic_exam_requests  enable row level security;
alter table uploaded_documents     enable row level security;
alter table admin_notes            enable row level security;

-- -------------------------------------------------------------
-- Função central: o usuário atual pode acessar a criança?
-- -------------------------------------------------------------
create or replace function public.can_access_child(c_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    public.is_admin()
    or exists ( -- responsável dono
      select 1 from children ch
      join guardians g on g.id = ch.guardian_id
      where ch.id = c_id and g.profile_id = auth.uid()
    )
    or exists ( -- profissional vinculado
      select 1 from child_professionals cp
      join professionals p on p.id = cp.professional_id
      where cp.child_id = c_id and p.profile_id = auth.uid()
    )
    or exists ( -- escola autorizada
      select 1 from child_schools cs
      join schools s on s.id = cs.school_id
      where cs.child_id = c_id and cs.authorized and s.profile_id = auth.uid()
    );
$$;

-- -------------------------------------------------------------
-- profiles: cada um lê/edita o próprio; admin vê todos
-- -------------------------------------------------------------
create policy profiles_self_select on profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on profiles for update
  using (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- children: acesso conforme can_access_child; admin gerencia
-- -------------------------------------------------------------
create policy children_select on children for select
  using (public.can_access_child(id));
create policy children_admin_write on children for all
  using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- Macro de política padrão para tabelas com coluna child_id:
-- leitura para quem acessa a criança; escrita para admin e
-- profissionais/responsáveis com acesso.
-- -------------------------------------------------------------
do $$
declare t text;
  child_tables text[] := array[
    'facial_analyses','mchat_sessions','screening_reports','neuro_profiles',
    'neuro_timeline_events','tasks','parent_diary_entries','professional_notes',
    'school_notes','evolution_reports','genetic_exam_requests','uploaded_documents',
    'game_sessions'
  ];
begin
  foreach t in array child_tables loop
    execute format(
      'create policy %1$s_select on %1$s for select using (public.can_access_child(child_id));', t);
    execute format(
      'create policy %1$s_write on %1$s for all using (public.can_access_child(child_id)) with check (public.can_access_child(child_id));', t);
  end loop;
end $$;

-- mchat_answers (via sessão)
create policy mchat_answers_all on mchat_answers for all
  using (exists (select 1 from mchat_sessions s where s.id = session_id and public.can_access_child(s.child_id)))
  with check (exists (select 1 from mchat_sessions s where s.id = session_id and public.can_access_child(s.child_id)));

-- task_completions (via task)
create policy task_completions_all on task_completions for all
  using (exists (select 1 from tasks tk where tk.id = task_id and public.can_access_child(tk.child_id)))
  with check (exists (select 1 from tasks tk where tk.id = task_id and public.can_access_child(tk.child_id)));

-- games: catálogo legível por autenticados; admin gerencia
create policy games_select on games for select using (auth.uid() is not null);
create policy games_admin_write on games for all using (public.is_admin()) with check (public.is_admin());

-- guardians / professionals / schools: admin gerencia; cada um lê o próprio
create policy guardians_self on guardians for select using (profile_id = auth.uid() or public.is_admin());
create policy guardians_admin on guardians for all using (public.is_admin()) with check (public.is_admin());
create policy professionals_self on professionals for select using (profile_id = auth.uid() or public.is_admin());
create policy professionals_admin on professionals for all using (public.is_admin()) with check (public.is_admin());
create policy schools_self on schools for select using (profile_id = auth.uid() or public.is_admin());
create policy schools_admin on schools for all using (public.is_admin()) with check (public.is_admin());

-- vínculos: leitura para quem acessa a criança; escrita admin
create policy child_prof_select on child_professionals for select using (public.can_access_child(child_id));
create policy child_prof_admin on child_professionals for all using (public.is_admin()) with check (public.is_admin());
create policy child_school_select on child_schools for select using (public.can_access_child(child_id));
create policy child_school_admin on child_schools for all using (public.is_admin()) with check (public.is_admin());

-- comercial: consultor e admin
create policy sensory_select on sensory_room_requests for select
  using (public.is_admin() or public.current_role() = 'consultor');
create policy sensory_insert on sensory_room_requests for insert
  with check (true); -- formulário público pode inserir leads
create policy sensory_write on sensory_room_requests for update
  using (public.is_admin() or public.current_role() = 'consultor');

-- admin_notes: somente admin
create policy admin_notes_all on admin_notes for all
  using (public.is_admin()) with check (public.is_admin());
