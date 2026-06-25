import { ok, fail, ValidationError, type ActionResult } from "@/lib/validation";
import { AuthzError } from "@/lib/guard";

/**
 * Executa o corpo de uma Server Action convertendo exceções conhecidas em
 * `ActionResult` de falha (mensagem amigável). Erros inesperados são mascarados.
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof ValidationError || e instanceof AuthzError) {
      return fail(e.message);
    }
    return fail("Não foi possível concluir a operação. Tente novamente.");
  }
}
