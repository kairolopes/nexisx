"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredUuid,
  requiredText,
  optionalText,
  optionalDate,
  oneOf,
} from "@/lib/validation";
import { runAction } from "./helpers";

const EVENT_KINDS = ["triagem", "facial", "relatorio", "consulta", "diario", "outro"] as const;

export interface TimelineEventInput {
  child_id: unknown;
  title: unknown;
  description?: unknown;
  kind?: unknown;
  event_date?: unknown;
}

/** Cria um evento manual na linha do tempo. Permitido a admin, responsável e profissional. */
export async function createTimelineEvent(input: TimelineEventInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "responsavel", "profissional"]);
    const payload = {
      child_id: requiredUuid(input.child_id, "Criança"),
      title: requiredText(input.title, "Título", 200),
      description: optionalText(input.description, 2000),
      kind: input.kind ? oneOf(input.kind, "Tipo", EVENT_KINDS) : "outro",
      event_date: optionalDate(input.event_date, "Data") ?? new Date().toISOString().slice(0, 10),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db
      .from("neuro_timeline_events")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível criar o evento.");
    return { id: data.id as string };
  });
}

/** Exclui um evento da linha do tempo. Permitido a admin e responsável. */
export async function deleteTimelineEvent(input: { id: unknown }) {
  return runAction(async () => {
    await getActor(["admin", "responsavel"]);
    const id = requiredUuid(input.id, "Evento");

    const db = createClient();
    const { error } = await db.from("neuro_timeline_events").delete().eq("id", id);
    if (error) throw new ValidationError("Não foi possível excluir o evento.");
    return { id };
  });
}
