# 0004 — Storage privado com acesso só por URL assinada

- **Status:** Aceito
- **Contexto data:** Fase 2 · Bloco D (Supabase Storage)

## Contexto
O sistema armazena mídia sensível: fotos de análise facial, laudos genéticos, documentos da
criança e vídeos/fotos da triagem digital. Esses arquivos não podem ser públicos nem
acessíveis fora do escopo de quem pode ver aquela criança.

## Decisão
Usar **buckets privados** (`facial-photos`, `genetic-reports`, `child-documents`,
`screening-media`), com convenção de caminho **obrigatória** `<child_id>/<uuid>.<ext>` (1º
segmento = `child_id`). As policies de `storage.objects` reusam
`can_access_child(storage_child_id(name))`, herdando exatamente o mesmo escopo por papel do
RLS das tabelas. O acesso a arquivos é **só por URL assinada temporária**
(`getSignedFileUrl`, ~300s) gerada server-side. Upload sempre por `lib/storage/` (valida
MIME/extensão/tamanho/caminho) + Server Actions.

## Consequências
- **Positivas:** nenhum arquivo público; mesmo modelo de autorização do banco; URLs expiram;
  validação centralizada de upload.
- **Negativas / trade-offs:** a convenção de caminho é um contrato implícito — quebrar o
  formato `<child_id>/...` quebra as policies (documentado em `ARCHITECTURE.md` e checklist do
  `CONTRIBUTING.md`).

## Não fazer
Tornar buckets públicos, servir arquivos sem URL assinada ou fugir da convenção de caminho.
