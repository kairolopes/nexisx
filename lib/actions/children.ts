"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { ValidationError } from "@/lib/validation";
import { runAction } from "./helpers";
import {
  requiredText,
  optionalText,
  optionalDate,
  optionalUuid,
  requiredUuid,
} from "@/lib/validation";

export interface ChildInput {
  full_name: unknown;
  birth_date?: unknown;
  guardian_id?: unknown;
  school_id?: unknown;
  notes?: unknown;
}

/** Cria uma criança. Escrita restrita a admin (políticas RLS de `children`). */
export async function createChild(input: ChildInput) {
  return runAction(async () => {
    await getActor(["admin"]);
    const payload = {
      full_name: requiredText(input.full_name, "Nome", 200),
      birth_date: optionalDate(input.birth_date, "Data de nascimento"),
      guardian_id: optionalUuid(input.guardian_id, "Responsável"),
      school_id: optionalUuid(input.school_id, "Escola"),
      notes: optionalText(input.notes),
    };

    const db = createClient();
    const { data, error } = await db.from("children").insert(payload).select("id").single();
    if (error) throw new ValidationError("Não foi possível cadastrar a criança.");
    return { id: data.id as string };
  });
}

/** Atualiza dados de uma criança. Escrita restrita a admin. */
export async function updateChild(id: unknown, input: ChildInput) {
  return runAction(async () => {
    await getActor(["admin"]);
    const childId = requiredUuid(id, "Criança");
    const payload = {
      full_name: requiredText(input.full_name, "Nome", 200),
      birth_date: optionalDate(input.birth_date, "Data de nascimento"),
      guardian_id: optionalUuid(input.guardian_id, "Responsável"),
      school_id: optionalUuid(input.school_id, "Escola"),
      notes: optionalText(input.notes),
    };

    const db = createClient();
    const { error } = await db.from("children").update(payload).eq("id", childId);
    if (error) throw new ValidationError("Não foi possível atualizar a criança.");
    return { id: childId };
  });
}
