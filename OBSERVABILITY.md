# OBSERVABILITY.md — Observabilidade do NexisX

> Plano de observabilidade. **Nada está instalado ainda** (sem Sentry, sem OpenTelemetry).
> Este documento define o que monitorar e como evoluir, sem adicionar dependências agora.

## Princípios

- **Privacidade primeiro:** logs e métricas **nunca** contêm PII de crianças, conteúdo
  clínico ou texto bruto de IA. A tabela `ai_requests` já segue isso (só metadados
  operacionais) e é o padrão para o resto.
- **Erros server-side não vazam para a UI** (`error.tsx`/`global-error.tsx`,
  `runAction`) — mas precisam ser **registrados** em algum lugar para diagnóstico.

## O que deve ser monitorado

### Erros críticos
- Falhas de autenticação/sessão e redirecionamentos inesperados de `requireRole`.
- **Negações de RLS** e erros de query hoje silenciados por `safeList`/`safeOne`
  (`lib/db/queries.ts`) — maior ponto cego atual.
- Falhas de Server Actions (`ActionResult.ok === false`) por tipo de erro
  (validação vs. autz vs. inesperado).
- Falhas de upload no Storage e de geração de URL assinada.
- Falhas da camada de IA (`result.ok === false`, capacidade não suportada, provider
  desconhecido).

### Logs recomendados (estruturados, sem PII)
- Em `lib/db/queries.ts`: logar quando o Supabase retorna `error` (antes de cair para
  `[]`/`null`), com `{ entity, code, requestId }` — corrige o ponto cego D2 do `TECH_DEBT.md`.
- Em `lib/actions/helpers.ts#runAction`: logar erros inesperados (mascarados para a UI) com
  categoria e `requestId`.
- Em `lib/storage/index.ts`: logar rejeições de validação (MIME/tamanho/caminho) e falhas de
  upload.

### Métricas de IA
- Volume de chamadas por `capability` e `provider` (de `ai_requests`).
- `success` rate, `duration_ms` (latência) e `estimated_cost` agregados.
- Taxa de `recapture_required` / `status='baixa_qualidade'` na Triagem Digital.
- Distribuição de `risk_level` (sanity check do mock; vital quando entrar IA real).

### Métricas de upload
- Taxa de sucesso/erro por bucket; tamanho médio; rejeições por validação.
- Expiração/uso de URLs assinadas (acessos negados).

### Métricas de Server Actions
- Contagem por action e por resultado (`ok` vs `error`), latência, e taxa de erro de
  validação vs. autz (indício de UI fora de sincronia com as regras).

## Evolução sugerida (futuro — não agora)

1. **Logger estruturado** leve server-side (JSON para stdout; a Vercel coleta).
2. **Sentry** para captura de exceções (server + client), com *scrubbing* de PII ativado.
3. **OpenTelemetry** para tracing distribuído de Server Actions → Supabase → Storage/IA.
4. **Dashboard de IA** lendo `ai_requests` (já existe a tabela) para custo/latência/sucesso.

> Ao instalar qualquer um destes: revisar política de PII, garantir que chaves fiquem fora do
> client e registrar a decisão em `docs/adr/` + `CHANGELOG.md`.
