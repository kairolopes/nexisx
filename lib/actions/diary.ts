"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { ValidationError, requiredUuid, optionalText } from "@/lib/validation";
import { runAction } from "./helpers";

export interface DiaryInput {
  child_id: unknown;
  mood?: unknown;
  sleep?: unknown;
  feeding?: unknown;
  crisis?: unknown;
  triggers?: unknown;
  achievements?: unknown;
  notes?: unknown;
}

/** Cria uma entrada no diário dos pais. Permitido a admin e responsável. */
export async function createDiaryEntry(input: DiaryInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "responsavel"]);
    const payload = {
      child_id: requiredUuid(input.child_id, "Criança"),
      mood: optionalText(input.mood, 80),
      sleep: optionalText(input.sleep, 200),
      feeding: optionalText(input.feeding, 200),
      crisis: optionalText(input.crisis, 500),
      triggers: optionalText(input.triggers, 500),
      achievements: optionalText(input.achievements, 500),
      notes: optionalText(input.notes, 2000),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db
      .from("parent_diary_entries")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível salvar o registro do diário.");
    return { id: data.id as string };
  });
}

export interface DiaryUpdateInput {
  id: unknown;
  mood?: unknown;
  notes?: unknown;
}

/** Edita humor e/ou observações de uma entrada do diário. Permitido a admin e responsável. */
export async function updateDiaryEntry(input: DiaryUpdateInput) {
  return runAction(async () => {
    await getActor(["admin", "responsavel"]);
    const id = requiredUuid(input.id, "Registro");

    const payload: Record<string, unknown> = {};
    if ("mood" in input) payload.mood = optionalText(input.mood, 80);
    if ("notes" in input) payload.notes = optionalText(input.notes, 2000);
    if (Object.keys(payload).length === 0) throw new ValidationError("Nada para atualizar.");

    const db = createClient();
    const { error } = await db.from("parent_diary_entries").update(payload).eq("id", id);
    if (error) throw new ValidationError("Não foi possível atualizar o registro.");
    return { id };
  });
}

/** Exclui uma entrada do diário. Permitido a admin e responsável. */
export async function deleteDiaryEntry(input: { id: unknown }) {
  return runAction(async () => {
    await getActor(["admin", "responsavel"]);
    const id = requiredUuid(input.id, "Registro");

    const db = createClient();
    const { error } = await db.from("parent_diary_entries").delete().eq("id", id);
    if (error) throw new ValidationError("Não foi possível excluir o registro.");
    return { id };
  });
}
