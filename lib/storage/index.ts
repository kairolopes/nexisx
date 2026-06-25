// Camada de upload/segurança de arquivos (Supabase Storage).
// Usa o client server-side (cookies → policies de Storage). O controle de acesso real
// está nas policies (supabase/storage.sql, via can_access_child); aqui validamos tipo,
// tamanho, extensão, caminho seguro e autenticação como defesa adicional.

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { ValidationError, requiredUuid } from "@/lib/validation";

export const BUCKETS = {
  facial: "facial-photos",
  genetic: "genetic-reports",
  documents: "child-documents",
} as const;

export type BucketId = (typeof BUCKETS)[keyof typeof BUCKETS];

interface UploadConfig {
  bucket: BucketId;
  maxBytes: number;
  mimes: string[];
  exts: string[];
}

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];

const CONFIG = {
  facial: {
    bucket: BUCKETS.facial,
    maxBytes: 8 * 1024 * 1024, // 8 MB
    mimes: IMAGE_MIMES,
    exts: IMAGE_EXTS,
  },
  genetic: {
    bucket: BUCKETS.genetic,
    maxBytes: 20 * 1024 * 1024, // 20 MB
    mimes: ["application/pdf", ...IMAGE_MIMES],
    exts: ["pdf", ...IMAGE_EXTS],
  },
  documents: {
    bucket: BUCKETS.documents,
    maxBytes: 20 * 1024 * 1024, // 20 MB
    mimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ...IMAGE_MIMES,
    ],
    exts: ["pdf", "doc", "docx", ...IMAGE_EXTS],
  },
} satisfies Record<string, UploadConfig>;

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Valida o arquivo contra a config do bucket. Lança ValidationError em falha. */
function validateFile(file: File, cfg: UploadConfig): string {
  if (!(file instanceof File) || file.size === 0) {
    throw new ValidationError("Arquivo inválido ou vazio.");
  }
  if (file.size > cfg.maxBytes) {
    throw new ValidationError(`Arquivo excede o tamanho máximo (${Math.round(cfg.maxBytes / 1024 / 1024)} MB).`);
  }
  const ext = extOf(file.name);
  if (!cfg.exts.includes(ext)) {
    throw new ValidationError(`Extensão não permitida (.${ext || "?"}).`);
  }
  if (file.type && !cfg.mimes.includes(file.type)) {
    throw new ValidationError("Tipo de arquivo não permitido.");
  }
  return ext;
}

/** Monta um caminho seguro: <child_id>/<uuid>.<ext> (1º segmento = child_id). */
function buildPath(childId: string, ext: string): string {
  return `${childId}/${crypto.randomUUID()}.${ext}`;
}

async function upload(cfg: UploadConfig, childIdRaw: unknown, file: File): Promise<string> {
  await getActor(); // exige sessão; o escopo por papel é aplicado pelas policies
  const childId = requiredUuid(childIdRaw, "Criança");
  const ext = validateFile(file, cfg);
  const path = buildPath(childId, ext);

  const db = createClient();
  const { error } = await db.storage.from(cfg.bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new ValidationError("Falha no upload do arquivo. Verifique suas permissões.");
  return path;
}

export function uploadFacialPhoto(childId: unknown, file: File) {
  return upload(CONFIG.facial, childId, file);
}

export function uploadGeneticReport(childId: unknown, file: File) {
  return upload(CONFIG.genetic, childId, file);
}

export function uploadChildDocument(childId: unknown, file: File) {
  return upload(CONFIG.documents, childId, file);
}

/** Gera uma URL assinada temporária para visualização/download seguro. */
export async function getSignedFileUrl(
  bucket: BucketId,
  path: string,
  expiresIn = 300,
): Promise<string | null> {
  try {
    const db = createClient();
    const { data, error } = await db.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) return null;
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

/** Remove um arquivo se as policies permitirem (RLS de storage.objects). */
export async function deleteFileIfAllowed(bucket: BucketId, path: string): Promise<boolean> {
  try {
    await getActor();
    const db = createClient();
    const { error } = await db.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
