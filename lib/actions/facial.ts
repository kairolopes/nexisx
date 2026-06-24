"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredUuid,
  optionalText,
} from "@/lib/validation";
import { runAction } from "./helpers";

export interface FacialAnalysisInput {
  child_id: unknown;
  consent: boolean;
  result?: unknown;
  observations?: unknown;
  recommendation?: unknown;
}

/**
 * Registra a estrutura mínima de uma análise facial (SEM upload de imagem — o Storage
 * fica para a fase posterior). Apenas persiste consentimento, status e resultado textual
 * preliminar. Permitido a admin, profissional e responsável (RLS valida a criança).
 */
export async function createFacialAnalysis(input: FacialAnalysisInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel"]);
    if (input.consent !== true) {
      throw new ValidationError("É necessário registrar o consentimento.");
    }
    const payload = {
      child_id: requiredUuid(input.child_id, "Criança"),
      image_path: null as string | null, // upload real será adicionado com o Storage
      consent: true,
      status: "concluido",
      result: optionalText(input.result, 200),
      observations: optionalText(input.observations, 2000),
      recommendation: optionalText(input.recommendation, 2000),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db
      .from("facial_analyses")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível registrar a análise facial.");
    return { id: data.id as string };
  });
}
