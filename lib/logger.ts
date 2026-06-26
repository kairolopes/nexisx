// Logger estruturado mínimo (sem PII). Emite uma linha JSON por evento.
//
// REGRA DE PRIVACIDADE: nunca registrar conteúdo de dados (nomes, textos clínicos,
// payloads, mensagens cruas de erro do Postgres — que podem ecoar valores). Apenas
// metadados operacionais: escopo, operação, código de erro e classificação.

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  scope?: string;
  op?: string;
  code?: string | null;
  kind?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, fields: LogFields = {}): void {
  const line = JSON.stringify({ level, msg, ...fields, ts: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, f?: LogFields) => emit("debug", msg, f),
  info: (msg: string, f?: LogFields) => emit("info", msg, f),
  warn: (msg: string, f?: LogFields) => emit("warn", msg, f),
  error: (msg: string, f?: LogFields) => emit("error", msg, f),
};

/**
 * Classifica e registra um erro retornado por uma query do Supabase/Postgres,
 * SEM expor PII (só o `code` e uma classificação). Distingue negação de RLS,
 * erro de autenticação e erro genérico de query. Lista vazia legítima (sem erro)
 * NÃO é registrada.
 */
export function logDbError(op: string, error: unknown): void {
  if (!error) return;
  const code = (error as { code?: string }).code ?? null;
  let kind = "query_error";
  if (code === "42501") kind = "rls_denied"; // insufficient_privilege
  else if (code === "28000" || code === "28P01") kind = "auth_error";
  else if (code === "PGRST301" || code === "PGRST302") kind = "auth_error";
  logger.warn("db_read_error", { scope: "db", op, code, kind });
}

/** Registra uma exceção (tipicamente falha de conexão/config), sem PII. */
export function logDbException(op: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "unknown";
  logger.error("db_read_exception", {
    scope: "db",
    op,
    kind: "connection_or_config",
    error: name,
  });
}
