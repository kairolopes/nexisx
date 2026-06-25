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
