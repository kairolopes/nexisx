"use server";

import { createClient } from "@/lib/supabase/server";
import { ValidationError, requiredText, optionalText } from "@/lib/validation";
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
