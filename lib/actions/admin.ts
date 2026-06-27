"use server";

import { revalidatePath } from "next/cache";
import { getActor } from "@/lib/guard";
import { createServiceClient } from "@/lib/supabase/service";
import { runAction } from "@/lib/actions/helpers";
import {
  requiredText,
  optionalText,
  requiredUuid,
  oneOf,
} from "@/lib/validation";
import type { Role } from "@/lib/types";

const ROLES: readonly Role[] = ["admin", "responsavel", "profissional", "escola", "consultor"];

// ─── Convite de usuário ──────────────────────────────────────────────────────

export async function inviteUser(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const email = requiredText(formData.get("email"), "e-mail", 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido.");
    }
    const supabase = createServiceClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/app`,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/app/usuarios");
  });
}

// ─── Promoção de papel ───────────────────────────────────────────────────────

export async function promoteRole(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const profileId = requiredUuid(formData.get("profileId"), "usuário");
    const role = oneOf(formData.get("role"), "papel", ROLES);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profileId);
    if (error) throw new Error(error.message);
    revalidatePath("/app/usuarios");
  });
}

// ─── Cadastro de profissional ────────────────────────────────────────────────

export async function createProfessional(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const full_name = requiredText(formData.get("full_name"), "nome", 200);
    const specialty = optionalText(formData.get("specialty"), 200);
    const registration = optionalText(formData.get("registration"), 50);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("professionals")
      .insert({ full_name, specialty, registration });
    if (error) throw new Error(error.message);
    revalidatePath("/app/profissionais");
  });
}

// ─── Cadastro de responsável ─────────────────────────────────────────────────

export async function createGuardian(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const full_name = requiredText(formData.get("full_name"), "nome", 200);
    const relationship = optionalText(formData.get("relationship"), 100);
    const phone = optionalText(formData.get("phone"), 30);
    const email = optionalText(formData.get("email"), 254);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("guardians")
      .insert({ full_name, relationship, phone, email });
    if (error) throw new Error(error.message);
    revalidatePath("/app/responsaveis");
  });
}

// ─── Cadastro de escola ──────────────────────────────────────────────────────

export async function createSchool(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const name = requiredText(formData.get("name"), "nome da escola", 200);
    const city = optionalText(formData.get("city"), 100);
    const contact_email = optionalText(formData.get("contact_email"), 254);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("schools")
      .insert({ name, city, contact_email });
    if (error) throw new Error(error.message);
    revalidatePath("/app/escolas");
  });
}

// ─── Vincular profissional ↔ criança ─────────────────────────────────────────

export async function linkProfessionalToChild(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const child_id = requiredUuid(formData.get("childId"), "criança");
    const professional_id = requiredUuid(formData.get("professionalId"), "profissional");
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("child_professionals")
      .upsert({ child_id, professional_id }, { onConflict: "child_id,professional_id" });
    if (error) throw new Error(error.message);
    revalidatePath("/app/profissionais");
    revalidatePath("/app/criancas");
  });
}

// ─── Vincular escola ↔ criança ───────────────────────────────────────────────

export async function linkSchoolToChild(formData: FormData) {
  return runAction(async () => {
    await getActor(["admin"]);
    const child_id = requiredUuid(formData.get("childId"), "criança");
    const school_id = requiredUuid(formData.get("schoolId"), "escola");
    const authorized = formData.get("authorized") !== "false";
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("child_schools")
      .upsert({ child_id, school_id, authorized }, { onConflict: "child_id,school_id" });
    if (error) throw new Error(error.message);
    revalidatePath("/app/escolas");
    revalidatePath("/app/criancas");
  });
}
