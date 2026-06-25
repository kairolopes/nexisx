// Erros tipados da camada de IA. Toda falha é convertida em `Result` pelas
// capacidades — a aplicação nunca recebe exceção crua nem stack.

export type AIErrorCode =
  | "timeout"
  | "rate_limit"
  | "unsupported"
  | "provider"
  | "validation"
  | "not_implemented"
  | "config";

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly retryable: boolean;

  constructor(code: AIErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.retryable = retryable;
  }
}

/** Timeout/cancelamento da chamada ao provedor. */
export class AITimeoutError extends AIError {
  constructor(message = "Tempo limite excedido na chamada de IA.") {
    super("timeout", message, true);
    this.name = "AITimeoutError";
  }
}

/** Limite de requisições do provedor — recuperável com backoff. */
export class AIRateLimitError extends AIError {
  constructor(message = "Limite de requisições do provedor de IA atingido.") {
    super("rate_limit", message, true);
    this.name = "AIRateLimitError";
  }
}

/** Nenhum provedor suporta a capacidade solicitada. */
export class AIUnsupportedError extends AIError {
  constructor(message = "Capacidade de IA não suportada pelo provedor.") {
    super("unsupported", message, false);
    this.name = "AIUnsupportedError";
  }
}

/** Falha genérica do provedor (ex.: 5xx) — pode acionar fallback. */
export class AIProviderError extends AIError {
  constructor(message = "Falha no provedor de IA.", retryable = true) {
    super("provider", message, retryable);
    this.name = "AIProviderError";
  }
}

/** Saída do modelo fora do schema esperado. */
export class AIValidationError extends AIError {
  constructor(message = "Resposta de IA em formato inválido.") {
    super("validation", message, false);
    this.name = "AIValidationError";
  }
}

/** Funcionalidade ainda não implementada (estrutura criada no Passo 1). */
export class AINotImplementedError extends AIError {
  constructor(what: string) {
    super("not_implemented", `Ainda não implementado: ${what}.`, false);
    this.name = "AINotImplementedError";
  }
}

/** Configuração inválida (ex.: provedor desconhecido em variável de ambiente). */
export class AIConfigError extends AIError {
  constructor(message = "Configuração de IA inválida.") {
    super("config", message, false);
    this.name = "AIConfigError";
  }
}
