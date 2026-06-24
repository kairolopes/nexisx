"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredText,
  requiredUuid,
  optionalText,
  intInRange,
} from "@/lib/validation";
import { runAction } from "./helpers";

export interface TaskInput {
  child_id: unknown;
  title: unknown;
  category?: unknown;
  cadence?: unknown;
  points?: unknown;
}

/** Cria uma tarefa para uma criança. Permitido a admin e profissional. */
export async function createTask(input: TaskInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional"]);
    const payload = {
      child_id: requiredUuid(input.child_id, "Criança"),
      title: requiredText(input.title, "Título", 200),
      category: optionalText(input.category, 80),
      cadence: optionalText(input.cadence, 80),
      points: input.points == null ? 0 : intInRange(input.points, "Pontos", 0, 1000),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db.from("tasks").insert(payload).select("id").single();
    if (error) throw new ValidationError("Não foi possível criar a tarefa.");
    return { id: data.id as string };
  });
}

/**
 * Conclui uma tarefa: registra a conclusão e marca o status como `concluida`.
 * O acesso à criança é garantido pelo RLS; qualquer papel com vínculo pode concluir.
 */
export async function completeTask(taskId: unknown) {
  return runAction(async () => {
    const actor = await getActor();
    const id = requiredUuid(taskId, "Tarefa");

    const db = createClient();
    const { error: cErr } = await db
      .from("task_completions")
      .insert({ task_id: id, completed_by: actor.profile.id });
    if (cErr) throw new ValidationError("Não foi possível registrar a conclusão.");

    const { error: uErr } = await db.from("tasks").update({ status: "concluida" }).eq("id", id);
    if (uErr) throw new ValidationError("Não foi possível atualizar o status da tarefa.");
    return { id };
  });
}
