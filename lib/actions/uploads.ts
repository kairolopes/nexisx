"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import { ValidationError, requiredUuid, optionalText } from "@/lib/validation";
import { runAction } from "./helpers";
import {
  uploadFacialPhoto,
  uploadGeneticReport,
  uploadChildDocument,
} from "@/lib/storage";

function fileFrom(form: FormData, field = "file"): File {
  const f = form.get(field);
  if (!(f instanceof File)) throw new ValidationError("Nenhum arquivo enviado.");
  return f;
}

/**
 * Triagem — análise facial com upload real da foto.
 * Faz upload para `facial-photos`, salva o `storage_path` em `facial_analyses` e
 * mantém o resultado da análise SIMULADO (sem IA). Exige consentimento.
 */
export async function submitFacialAnalysis(form: FormData) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel"]);
    const childId = requiredUuid(form.get("childId"), "Criança");
    if (form.get("consent") !== "true") {
      throw new ValidationError("É necessário registrar o consentimento.");
    }
    const file = fileFrom(form);
    const path = await uploadFacialPhoto(childId, file);

    const db = createClient();
    const { data, error } = await db
      .from("facial_analyses")
      .insert({
        child_id: childId,
        image_path: path,
        consent: true,
        status: "concluido",
        result: "Atenção moderada (resultado ilustrativo)",
        observations:
          "Resultado preliminar simulado. Complementar com M-CHAT e avaliação profissional.",
        recommendation: "Avaliação com neuropediatra e/ou psicólogo especializado.",
        created_by: actor.profile.id,
      })
      .select("id")
      .single();
    if (error) throw new ValidationError("Upload concluído, mas falhou ao registrar a análise.");
    return { id: data.id as string, path };
  });
}

/** Genética — upload de laudo (PDF/imagem) → bucket `genetic-reports` + uploaded_documents. */
export async function uploadGeneticReportDoc(form: FormData) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel"]);
    const childId = requiredUuid(form.get("childId"), "Criança");
    const file = fileFrom(form);
    const path = await uploadGeneticReport(childId, file);

    const db = createClient();
    const { data, error } = await db
      .from("uploaded_documents")
      .insert({
        child_id: childId,
        file_path: path,
        doc_type: "laudo_genetico",
        uploaded_by: actor.profile.id,
      })
      .select("id")
      .single();
    if (error) throw new ValidationError("Upload concluído, mas falhou ao registrar o laudo.");
    return { id: data.id as string, path };
  });
}

/** Documentos da criança — upload geral → bucket `child-documents` + uploaded_documents. */
export async function uploadChildDocumentDoc(form: FormData) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel", "escola"]);
    const childId = requiredUuid(form.get("childId"), "Criança");
    const docType = optionalText(form.get("docType"), 80) ?? "documento";
    const file = fileFrom(form);
    const path = await uploadChildDocument(childId, file);

    const db = createClient();
    const { data, error } = await db
      .from("uploaded_documents")
      .insert({
        child_id: childId,
        file_path: path,
        doc_type: docType,
        uploaded_by: actor.profile.id,
      })
      .select("id")
      .single();
    if (error) throw new ValidationError("Upload concluído, mas falhou ao registrar o documento.");
    return { id: data.id as string, path };
  });
}
