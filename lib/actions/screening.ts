"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredUuid,
  optionalUuid,
  optionalText,
  intInRange,
} from "@/lib/validation";
import { runAction } from "./helpers";
import { uploadScreeningMedia } from "@/lib/storage";
import {
  analyzeBehavioralScreening,
  fuseScreening,
  resolveProvider,
  type AIMediaRef,
  type MchatRef,
  type RiskLevel,
} from "@/lib/ai";
import { estimateCost } from "@/lib/ai/shared/cost";
import { behavioralInterpretationV1 } from "@/lib/ai/behavioral/prompts/behavioral-interpretation-v1";

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

// ───────────────────────── Triagem Digital Assistiva ──────────────────────────

const VIDEO_EXTS = ["mp4", "webm", "mov"];
const MAX_VIDEO_MS = 60_000; // 60 segundos

function fileFrom(form: FormData, field = "file"): File {
  const f = form.get(field);
  if (!(f instanceof File)) throw new ValidationError("Nenhum arquivo enviado.");
  return f;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || VIDEO_EXTS.includes(extOf(file.name));
}

/**
 * Triagem Digital Assistiva — cria uma sessão de análise comportamental digital.
 *
 * Fluxo: valida consentimento/criança/mídia → upload no bucket privado
 * `screening-media` → executa `analyzeBehavioralScreening` (MockProvider) → grava a
 * sessão, os sinais comportamentais, a fusão com o M-CHAT (se houver) e a auditoria
 * de IA. É TRIAGEM assistiva, nunca diagnóstico.
 */
export async function createDigitalScreening(form: FormData) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel"]);
    const childId = requiredUuid(form.get("childId"), "Criança");
    if (form.get("consent") !== "true") {
      throw new ValidationError("É necessário registrar o consentimento.");
    }

    const file = fileFrom(form);
    const mediaKind: "video" | "photo" = isVideoFile(file) ? "video" : "photo";

    // Duração (informada pelo cliente): vídeo até 60s. Validada quando presente.
    const durRaw = form.get("durationMs");
    let durationMs: number | undefined;
    if (durRaw != null && durRaw !== "") {
      durationMs = intInRange(durRaw, "Duração do vídeo", 1, MAX_VIDEO_MS);
    }

    // Upload da mídia (policies de Storage aplicam o escopo por can_access_child).
    const path = await uploadScreeningMedia(childId, file);

    // Bytes lidos server-side para a análise — nunca trafegam pelo client.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const media: AIMediaRef = {
      bytes,
      mimeType: file.type || "application/octet-stream",
      durationMs,
    };

    const provider = resolveProvider("behavioral.digitalScreening");
    const requestId = crypto.randomUUID();
    const promptVersion = behavioralInterpretationV1.version;
    const capability = "behavioral.digitalScreening" as const;
    const cost = estimateCost({ provider: provider.id, model: provider.model, capability });
    const db = createClient();

    const startedAt = Date.now();
    const result = await analyzeBehavioralScreening(
      {
        mediaKind,
        media,
        stimuli: mediaKind === "video" ? [{ kind: "name_call", atMs: 2_000 }] : undefined,
      },
      { requestId },
    );
    const latencyMs = Date.now() - startedAt;

    // Auditoria operacional (sem PII / sem texto bruto) — sempre registrada.
    async function audit(success: boolean, error: string | null) {
      await db.from("ai_requests").insert({
        provider: provider.id,
        model: provider.model,
        capability,
        prompt_version: promptVersion,
        request_id: requestId,
        duration_ms: latencyMs,
        estimated_cost: cost,
        success,
        error,
        child_id: childId,
      });
    }

    if (!result.ok) {
      await db.from("digital_screening_sessions").insert({
        child_id: childId,
        media_kind: mediaKind,
        media_path: path,
        consent: true,
        status: "erro",
        provider: provider.id,
        model: provider.model,
        prompt_version: promptVersion,
        request_id: requestId,
        latency_ms: latencyMs,
        error_reason: result.error.code,
        created_by: actor.profile.id,
      });
      await audit(false, result.error.code);
      throw new ValidationError("Não foi possível processar a triagem. Tente novamente.");
    }

    const out = result.data;
    const status = out.recaptureRequired ? "baixa_qualidade" : "concluido";

    const { data: sessionRow, error: sessionErr } = await db
      .from("digital_screening_sessions")
      .insert({
        child_id: childId,
        media_kind: mediaKind,
        media_path: path,
        consent: true,
        capture_quality: out.captureQuality,
        risk_score: out.riskScore,
        risk_level: out.riskLevel,
        prediction_confidence: out.predictionConfidence,
        recommendation: out.recommendation,
        recapture_required: out.recaptureRequired,
        status,
        provider: provider.id,
        model: provider.model,
        prompt_version: promptVersion,
        request_id: requestId,
        latency_ms: latencyMs,
        estimated_cost: cost,
        processed_at: new Date().toISOString(),
        created_by: actor.profile.id,
      })
      .select("id")
      .single();

    if (sessionErr) {
      await audit(false, "persist_session");
      throw new ValidationError("Upload e análise concluídos, mas falhou ao salvar a sessão.");
    }
    const sessionId = sessionRow.id as string;

    // Sinais comportamentais — base da explicabilidade.
    if (out.signals.length > 0) {
      await db.from("behavioral_signals").insert(
        out.signals.map((s) => ({
          session_id: sessionId,
          child_id: childId,
          signal: s.signal,
          indicator: s.indicator,
          confidence: s.confidence,
          note: s.note,
        })),
      );
    }

    // Fusão com o M-CHAT mais recente da criança, se existir e estiver classificado.
    let fusion: ReturnType<typeof fuseScreening> | null = null;
    const { data: mchat } = await db
      .from("mchat_sessions")
      .select("id, score, risk")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (mchat && typeof mchat.score === "number" && mchat.risk) {
      const mchatRef: MchatRef = { score: mchat.score, risk: mchat.risk as RiskLevel };
      fusion = fuseScreening({ behavioral: out, mchat: mchatRef });
      await db.from("screening_fusions").insert({
        child_id: childId,
        session_id: sessionId,
        mchat_session_id: mchat.id,
        combined_risk: fusion.combinedRisk,
        combined_confidence: fusion.combinedConfidence,
        recommendation: fusion.recommendation,
        rationale: fusion.rationale,
      });
    }

    await audit(true, null);

    // Resultado estruturado para a UI (passo futuro).
    return {
      sessionId,
      mediaKind,
      captureQuality: out.captureQuality,
      riskScore: out.riskScore,
      riskLevel: out.riskLevel,
      predictionConfidence: out.predictionConfidence,
      recommendation: out.recommendation,
      recaptureRequired: out.recaptureRequired,
      explanation: out.explanation,
      signals: out.signals,
      fusion,
    };
  });
}
