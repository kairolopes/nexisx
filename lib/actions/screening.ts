"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredUuid,
  optionalUuid,
  optionalText,
} from "@/lib/validation";
import { runAction } from "./helpers";

export interface ScreeningReportInput {
  child_id: unknown;
  facial_analysis_id?: unknown;
  mchat_session_id?: unknown;
  priority?: unknown;
  recommendation?: unknown;
  next_steps?: unknown;
}

/** Salva um relatório preliminar de triagem. Permitido a admin e profissional. */
export async function createScreeningReport(input: ScreeningReportInput) {
  return runAction(async () => {
    await getActor(["admin", "profissional"]);
    const payload = {
      child_id: requiredUuid(input.child_id, "Criança"),
      facial_analysis_id: optionalUuid(input.facial_analysis_id, "Análise facial"),
      mchat_session_id: optionalUuid(input.mchat_session_id, "Sessão M-CHAT"),
      priority: optionalText(input.priority, 40),
      recommendation: optionalText(input.recommendation, 2000),
      next_steps: optionalText(input.next_steps, 2000),
    };

    const db = createClient();
    const { data, error } = await db
      .from("screening_reports")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível salvar o relatório de triagem.");
    return { id: data.id as string };
  });
}
