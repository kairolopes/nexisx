# DATABASE.md — Modelo de dados e RLS

Banco PostgreSQL no Supabase. Arquivos:
- `supabase/schema.sql` — tipos, tabelas, índices, triggers e funções.
- `supabase/schema_rls.sql` — habilita RLS e cria as políticas (rode **depois**).

## Tipos (enums)
- `role_type`: `admin | responsavel | profissional | escola | consultor`
- `risk_level`: `baixo | moderado | alto`
- `task_status`: `pendente | em_andamento | concluida`

## Tabelas
**Identidade/entidades:** `profiles`, `guardians`, `professionals`, `schools`, `children`,
`child_professionals`, `child_schools`.

**Triagem:** `facial_analyses`, `mchat_sessions`, `mchat_answers`, `screening_reports`.

**Acompanhamento:** `neuro_profiles`, `neuro_timeline_events`, `tasks`, `task_completions`,
`games`, `game_sessions`, `parent_diary_entries`, `professional_notes`, `school_notes`,
`evolution_reports`.

**Comercial/genética/docs:** `sensory_room_requests`, `genetic_exam_requests`,
`uploaded_documents`, `admin_notes`.

## Funções auxiliares
- `handle_new_user()` — cria `profiles` ao registrar usuário (trigger em `auth.users`).
- `current_role()` — papel do usuário atual.
- `is_admin()` — booleano.
- `can_access_child(child_id)` — coração da autorização: verdadeiro se o usuário for
  admin, responsável dono, profissional vinculado ou escola autorizada.

## Política de acesso (RLS)
| Papel | Acesso |
|------|--------|
| admin | tudo |
| responsavel | apenas seus filhos |
| profissional | apenas crianças vinculadas (`child_professionals`) |
| escola | apenas crianças autorizadas (`child_schools.authorized`) |
| consultor | solicitações comerciais (salas) e exames |

Tabelas com `child_id` recebem automaticamente políticas de `select`/escrita baseadas em
`can_access_child()` (bloco `do $$ ... $$` em `schema_rls.sql`). Tabelas derivadas
(`mchat_answers`, `task_completions`) verificam o acesso através da entidade-pai.

> Ao criar uma nova tabela com `child_id`, adicione o nome dela ao array `child_tables`
> para herdar as políticas padrão.
