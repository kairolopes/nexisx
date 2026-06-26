"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { runAction } from "@/lib/actions/helpers";
import { ValidationError, requiredText, optionalText } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function upsertSettings(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);

    const org_name = requiredText(formData.get("org_name"), "nome da organização");
    const org_email = optionalText(formData.get("org_email"));
    const org_url = optionalText(formData.get("org_url"));

    const db = createClient();
    const rows = [
      { key: "org_name", value: org_name, updated_at: new Date().toISOString() },
      { key: "org_email", value: org_email ?? "", updated_at: new Date().toISOString() },
      { key: "org_url", value: org_url ?? "", updated_at: new Date().toISOString() },
    ];

    const { error } = await db
      .from("app_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) throw new ValidationError("Não foi possível salvar as configurações.");

    revalidatePath("/app/configuracoes");
  });
}
