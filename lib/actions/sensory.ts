"use server";

import { createClient } from "@/lib/supabase/server";
import { ValidationError, requiredText, optionalText, requiredUuid, oneOf } from "@/lib/validation";
import { getActor } from "@/lib/guard";
import { runAction } from "./helpers";

export interface SensoryRoomRequestInput {
  requester_name: unknown;
  email?: unknown;
  phone?: unknown;
  environment?: unknown;
  message?: unknown;
}

/**
 * Cria uma solicitação de sala sensorial (lead). Pode ser disparada pelo formulário
 * público — o RLS permite INSERT anônimo nesta tabela. Não exige sessão.
 */
export async function createSensoryRoomRequest(input: SensoryRoomRequestInput) {
  return runAction(async () => {
    const payload = {
      requester_name: requiredText(input.requester_name, "Nome", 200),
      email: optionalText(input.email, 200),
      phone: optionalText(input.phone, 40),
      environment: optionalText(input.environment, 120),
      message: optionalText(input.message, 2000),
    };

    const db = createClient();
    const { data, error } = await db
      .from("sensory_room_requests")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível enviar a solicitação.");
    return { id: data.id as string };
  });
}

export const SENSORY_REQUEST_STATUSES = [
  "novo",
  "em_contato",
  "aprovado",
  "concluido",
  "cancelado",
] as const;

export interface SensoryRoomRequestUpdateInput {
  id: unknown;
  status: unknown;
  notes?: unknown;
}

/**
 * Atualiza o status de uma solicitação de sala sensorial.
 * Permitido a admin e consultor; RLS garante a restrição no banco.
 */
export async function updateSensoryRoomRequest(input: SensoryRoomRequestUpdateInput) {
  return runAction(async () => {
    await getActor(["admin", "consultor"]);
    const id = requiredUuid(input.id, "Solicitação");
    const status = oneOf(input.status, "Status", SENSORY_REQUEST_STATUSES);

    const db = createClient();
    const { error } = await db
      .from("sensory_room_requests")
      .update({ status })
      .eq("id", id);
    if (error) throw new ValidationError("Não foi possível atualizar a solicitação.");
    return { id };
  });
}
