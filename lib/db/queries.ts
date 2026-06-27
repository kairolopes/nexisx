// Camada de leitura tipada. Toda leitura do banco passa por aqui — as páginas não
// chamam o Supabase diretamente. Usa o client server-side (cookies → RLS), portanto
// cada consulta já respeita a sessão e as políticas de acesso do usuário atual.
//
// Resiliência: leituras toleram falha (devolvem fallback []/null) para não quebrar a
// UI. Para NÃO mascarar falhas reais (RLS/conexão/config), erros são REGISTRADOS de
// forma estruturada e sem PII (ver lib/logger.ts) — distinguindo erro de query, de
// RLS e de conexão de uma lista legitimamente vazia.

import { createClient } from "@/lib/supabase/server";
import { logDbError, logDbException } from "@/lib/logger";
import type {
  ProfileRow,
  ChildRow,
  GuardianRow,
  ProfessionalRow,
  SchoolRow,
  TaskRow,
  TaskCompletionRow,
  ParentDiaryEntryRow,
  NeuroTimelineEventRow,
  SensoryRoomRequestRow,
  GeneticExamRequestRow,
  UploadedDocumentRow,
  ScreeningReportRow,
  MchatSessionRow,
  FacialAnalysisRow,
  DigitalScreeningSessionRow,
  BehavioralSignalRow,
  ScreeningFusionRow,
  AiRequestRow,
  GameSessionRow,
  AppSettingRow,
} from "./types";

/**
 * Executa uma leitura tolerante a falha: em erro (inclusive RLS negando acesso ou
 * Supabase não configurado) devolve o fallback, mantendo as telas estáveis — mas
 * registra o erro (sem PII) para diagnóstico.
 */
type Db = ReturnType<typeof createClient>;
type QueryResult = PromiseLike<{ data: unknown; error: unknown }>;

async function safeList<T>(op: string, run: (db: Db) => QueryResult): Promise<T[]> {
  try {
    const db = createClient();
    const { data, error } = await run(db);
    if (error) logDbError(op, error);
    return (data as T[] | null) ?? [];
  } catch (e) {
    logDbException(op, e);
    return [];
  }
}

async function safeOne<T>(op: string, run: (db: Db) => QueryResult): Promise<T | null> {
  try {
    const db = createClient();
    const { data, error } = await run(db);
    if (error) logDbError(op, error);
    return (data as T | null) ?? null;
  } catch (e) {
    logDbException(op, e);
    return null;
  }
}

type CountTable =
  | "children"
  | "guardians"
  | "professionals"
  | "schools"
  | "tasks"
  | "task_completions"
  | "parent_diary_entries"
  | "neuro_timeline_events"
  | "sensory_room_requests"
  | "genetic_exam_requests"
  | "uploaded_documents"
  | "screening_reports"
  | "mchat_sessions"
  | "facial_analyses";

/** Conta linhas de uma tabela respeitando RLS. Em erro/sem config → 0. */
export async function countRows(table: CountTable): Promise<number> {
  try {
    const db = createClient();
    const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
    if (error) logDbError(`count:${table}`, error);
    return count ?? 0;
  } catch (e) {
    logDbException(`count:${table}`, e);
    return 0;
  }
}

// ---------------- children ----------------
export function listChildren() {
  return safeList<ChildRow>("children.list", (db) =>
    db.from("children").select("*").order("full_name", { ascending: true }),
  );
}
export function getChild(id: string) {
  return safeOne<ChildRow>("children.get", (db) =>
    db.from("children").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- profiles ----------------
export function listProfiles() {
  return safeList<ProfileRow>("profiles.list", (db) =>
    db.from("profiles").select("*").order("created_at", { ascending: false }),
  );
}

// ---------------- guardians ----------------
export function listGuardians() {
  return safeList<GuardianRow>("guardians.list", (db) =>
    db.from("guardians").select("*").order("full_name", { ascending: true }),
  );
}

// ---------------- professionals ----------------
export function listProfessionals() {
  return safeList<ProfessionalRow>("professionals.list", (db) =>
    db.from("professionals").select("*").order("full_name", { ascending: true }),
  );
}

// ---------------- schools ----------------
export function listSchools() {
  return safeList<SchoolRow>("schools.list", (db) =>
    db.from("schools").select("*").order("name", { ascending: true }),
  );
}

// ---------------- tasks ----------------
export function listTasks(childId?: string) {
  return safeList<TaskRow>("tasks.list", (db) => {
    let q = db.from("tasks").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getTask(id: string) {
  return safeOne<TaskRow>("tasks.get", (db) =>
    db.from("tasks").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- task_completions ----------------
export function listTaskCompletions(taskId: string) {
  return safeList<TaskCompletionRow>("task_completions.list", (db) =>
    db.from("task_completions").select("*").eq("task_id", taskId).order("completed_at", { ascending: false }),
  );
}

// ---------------- parent_diary_entries ----------------
export function listDiaryEntries(childId?: string) {
  return safeList<ParentDiaryEntryRow>("parent_diary_entries.list", (db) => {
    let q = db.from("parent_diary_entries").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- neuro_timeline_events ----------------
export function listTimelineEvents(childId?: string) {
  return safeList<NeuroTimelineEventRow>("neuro_timeline_events.list", (db) => {
    let q = db.from("neuro_timeline_events").select("*").order("event_date", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- sensory_room_requests ----------------
export function listSensoryRoomRequests() {
  return safeList<SensoryRoomRequestRow>("sensory_room_requests.list", (db) =>
    db.from("sensory_room_requests").select("*").order("created_at", { ascending: false }),
  );
}

// ---------------- genetic_exam_requests ----------------
export function listGeneticExamRequests(childId?: string) {
  return safeList<GeneticExamRequestRow>("genetic_exam_requests.list", (db) => {
    let q = db.from("genetic_exam_requests").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- uploaded_documents ----------------
export function listDocuments(childId?: string) {
  return safeList<UploadedDocumentRow>("uploaded_documents.list", (db) => {
    let q = db.from("uploaded_documents").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

/** Laudos genéticos (uploaded_documents com doc_type = 'laudo_genetico'). */
export function listGeneticReports() {
  return safeList<UploadedDocumentRow>("uploaded_documents.genetic", (db) =>
    db
      .from("uploaded_documents")
      .select("*")
      .eq("doc_type", "laudo_genetico")
      .order("created_at", { ascending: false }),
  );
}

// ---------------- screening_reports ----------------
export function listScreeningReports(childId?: string) {
  return safeList<ScreeningReportRow>("screening_reports.list", (db) => {
    let q = db.from("screening_reports").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getScreeningReport(id: string) {
  return safeOne<ScreeningReportRow>("screening_reports.get", (db) =>
    db.from("screening_reports").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- mchat_sessions ----------------
export function listMchatSessions(childId?: string) {
  return safeList<MchatSessionRow>("mchat_sessions.list", (db) => {
    let q = db.from("mchat_sessions").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getMchatSession(id: string) {
  return safeOne<MchatSessionRow>("mchat_sessions.get", (db) =>
    db.from("mchat_sessions").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- facial_analyses ----------------
export function listFacialAnalyses(childId?: string) {
  return safeList<FacialAnalysisRow>("facial_analyses.list", (db) => {
    let q = db.from("facial_analyses").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getFacialAnalysis(id: string) {
  return safeOne<FacialAnalysisRow>("facial_analyses.get", (db) =>
    db.from("facial_analyses").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- Triagem Digital Assistiva ----------------
export function listDigitalScreeningSessions(childId?: string) {
  return safeList<DigitalScreeningSessionRow>("digital_screening_sessions.list", (db) => {
    let q = db
      .from("digital_screening_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

export function getDigitalScreeningSession(id: string) {
  return safeOne<DigitalScreeningSessionRow>("digital_screening_sessions.get", (db) =>
    db.from("digital_screening_sessions").select("*").eq("id", id).maybeSingle(),
  );
}

export function listBehavioralSignals(sessionId: string) {
  return safeList<BehavioralSignalRow>("behavioral_signals.list", (db) =>
    db
      .from("behavioral_signals")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
  );
}

export function listScreeningFusions(childId?: string) {
  return safeList<ScreeningFusionRow>("screening_fusions.list", (db) => {
    let q = db
      .from("screening_fusions")
      .select("*")
      .order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- game_sessions ----------------
export function listGameSessions(childId?: string) {
  return safeList<GameSessionRow>("game_sessions.list", (db) => {
    let q = db.from("game_sessions").select("*").order("played_at", { ascending: false }).limit(50);
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

/** Configurações da organização — RLS restringe a admin; em outros papéis devolve []. */
export function getAppSettings() {
  return safeList<AppSettingRow>("app_settings.list", (db) =>
    db.from("app_settings").select("*"),
  );
}

/** Auditoria operacional de IA — RLS restringe a admin; em outros papéis devolve []. */
export function listAiRequests(limit = 100) {
  return safeList<AiRequestRow>("ai_requests.list", (db) =>
    db
      .from("ai_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}
