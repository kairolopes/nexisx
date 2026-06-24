// Validação leve e sem dependências para inputs de Server Actions.

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

/** Erro de validação acumulável (lançado e convertido em ActionResult). */
export class ValidationError extends Error {}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Valida data no formato YYYY-MM-DD (ou ISO) e que seja uma data real. */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

/** Texto obrigatório (não-vazio após trim). Retorna o valor já normalizado. */
export function requiredText(value: unknown, field: string, max = 2000): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`O campo "${field}" é obrigatório.`);
  }
  const v = value.trim();
  if (v.length > max) {
    throw new ValidationError(`O campo "${field}" excede o tamanho máximo (${max}).`);
  }
  return v;
}

/** Texto opcional normalizado: "" vira null. */
export function optionalText(value: unknown, max = 4000): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (v === "") return null;
  return v.slice(0, max);
}

export function requiredUuid(value: unknown, field: string): string {
  if (!isUuid(value)) {
    throw new ValidationError(`Identificador inválido para "${field}".`);
  }
  return value;
}

export function optionalUuid(value: unknown, field: string): string | null {
  if (value == null || value === "") return null;
  if (!isUuid(value)) {
    throw new ValidationError(`Identificador inválido para "${field}".`);
  }
  return value;
}

export function optionalDate(value: unknown, field: string): string | null {
  if (value == null || value === "") return null;
  if (!isValidDate(value)) {
    throw new ValidationError(`Data inválida para "${field}".`);
  }
  return value as string;
}

export function intInRange(value: unknown, field: string, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new ValidationError(`Valor inválido para "${field}".`);
  }
  return Math.trunc(n);
}

export function oneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ValidationError(`Valor inválido para "${field}".`);
  }
  return value as T;
}
