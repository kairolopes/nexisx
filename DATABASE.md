# DATABASE.md — Modelo de dados e RLS

Banco PostgreSQL no Supabase. Arquivos:
- `supabase/schema.sql` — tipos, tabelas, índices, triggers e funções.
- `supabase/schema_rls.sql` — habilita RLS e cria as políticas (rode **depois**).
- `supabase/storage.sql` — buckets privados e policies de Storage (rode após o RLS).
- `supabase/screening_digital.sql` — **aditivo** da Triagem Digital Assistiva: tabelas,
  RLS e bucket `screening-media` (rode após `storage.sql`). Idempotente; não altera
  `facial_analyses`.
- `supabase/seed.sql` — dados de **desenvolvimento** (rode por último, só em dev).

## Storage
Três buckets **privados**: `facial-photos`, `genetic-reports`, `child-documents`.
Convenção de caminho: `<child_id>/<uuid>.<ext>` — o 1º segmento é o `child_id`, o que
permite às policies de `storage.objects` reaproveitarem `can_access_child()` (mesmo
escopo por papel do RLS das tabelas), via a função `storage_child_id(name)`.
Acesso aos arquivos só por **URL assinada temporária** (`getSignedFileUrl`); nada é
público. Upload/leitura passam por `lib/storage/` e pelas Server Actions de
`lib/actions/uploads.ts`.

## Acesso pela aplicação
A aplicação nunca consulta o Supabase direto nas páginas: leituras passam por
`lib/db/queries.ts` (tipadas, em `lib/db/types.ts`) e escritas por Server Actions em
`lib/actions/*` (validadas por `lib/validation.ts`, autorizadas por `getActor()`).
Ambas usam o client server-side (cookies → RLS).

## Seed de desenvolvimento
`supabase/seed.sql` insere usuários demo (senha `nexisx123`): admin, responsável,
profissional e escola, além de 2 crianças, vínculos, tarefas, diário, timeline e
solicitações. **Não usar em produção** (insere direto em `auth.users`).

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

**Triagem Digital Assistiva (aditivo — `screening_digital.sql`):**
`digital_screening_sessions`, `behavioral_signals`, `screening_fusions` (ligadas à
criança via `child_id`, RLS por `can_access_child()`) e `ai_requests` (auditoria
operacional de IA — **somente admin**, sem PII/texto bruto). Bucket privado
`screening-media` (`<child_id>/<uuid>.<ext>`), policies reusam `can_access_child()`.
`facial_analyses` permanece **intacta** como estrutura legada.

## Funções auxiliares
- `handle_new_user()` — cria `profiles` ao registrar usuário (trigger em `auth.users`).
  **O papel é sempre `responsavel`** — nunca lido de `raw_user_meta_data` (esse dado vem
  do cliente e poderia forjar `admin`).
- `enforce_role_change()` — trigger `before update` em `profiles`: se quem edita não é
  admin (e há `auth.uid()`), qualquer mudança de `role` é revertida silenciosamente.
  Promoção de papel só por **admin** ou **service_role/SQL direto** (contexto sem
  `auth.uid()`).
- `current_role()` — papel do usuário atual.
- `is_admin()` — booleano.
- `can_access_child(child_id)` — coração da autorização: verdadeiro se o usuário for
  admin, responsável dono, profissional vinculado ou escola autorizada.

> **Promover um usuário** (ex.: a profissional): faça-o como admin ou via service_role,
> por ex. `update profiles set role = 'profissional' where id = '...';`. Um usuário comum
> não consegue alterar o próprio papel.

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

As tabelas da Triagem Digital (`digital_screening_sessions`, `behavioral_signals`,
`screening_fusions`) já estão no array `child_tables` do `screening_digital.sql`.
`ai_requests` não tem `child_id` no escopo de acesso: sua policy é exclusiva de admin
(`is_admin()`). Nada das novas tabelas nem do bucket `screening-media` é público.
