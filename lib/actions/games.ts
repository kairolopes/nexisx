"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { requiredUuid, intInRange, ValidationError } from "@/lib/validation";
import { runAction } from "@/lib/actions/helpers";

export interface SaveGameSessionInput {
  child_id: unknown;
  score: unknown;
  phase?: unknown;
}

/** Persiste o resultado de uma sessão de jogo. Qualquer papel autenticado com acesso à criança. */
export async function saveGameSession(input: SaveGameSessionInput) {
  return runAction(async () => {
    await getActor();
    const child_id = requiredUuid(input.child_id, "criança");
    const score = intInRange(input.score, "pontuação", 0, 9999);
    const phase = input.phase != null ? intInRange(input.phase, "fase", 1, 99) : 1;

    const db = createClient();
    const { error } = await db
      .from("game_sessions")
      .insert({ child_id, score, phase, game_id: null });
    if (error) throw new ValidationError("Não foi possível salvar a sessão do jogo.");

    revalidatePath("/app/jogos");
  });
}
