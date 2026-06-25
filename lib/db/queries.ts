// Camada de leitura tipada. Toda leitura do banco passa por aqui — as páginas não
// chamam o Supabase diretamente. Usa o client server-side (cookies → RLS), portanto
// cada consulta já respeita a sessão e as políticas de acesso do usuário atual.

import { createClient } from "@/lib/supabase/server";
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
} from "./types";

/**
 * Executa uma leitura tolerante a falha: em erro (inclusive RLS negando acesso ou
 * Supabase não configurado) devolve o fallback, mantendo as telas estáveis.
 */
type Db = ReturnType<typeof createClient>;
type QueryResult = PromiseLike<{ data: unknown; error: unknown }>;

async function safeList<T>(run: (db: Db) => QueryResult): Promise<T[]> {
  try {
    const db = createClient();
    const { data } = await run(db);
    return (data as T[] | null) ?? [];
  } catch {
    return [];
  }
}

async function safeOne<T>(run: (db: Db) => QueryResult): Promise<T | null> {
  try {
    const db = createClient();
    const { data } = await run(db);
    return (data as T | null) ?? null;
  } catch {
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
    const { count } = await db.from(table).select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ---------------- children ----------------
export function listChildren() {
  return safeList<ChildRow>((db) =>
    db.from("children").select("*").order("full_name", { ascending: true }),
  );
}
export function getChild(id: string) {
  return safeOne<ChildRow>((db) => db.from("children").select("*").eq("id", id).maybeSingle());
}

// ---------------- profiles ----------------
export function listProfiles() {
  return safeList<ProfileRow>((db) =>
    db.from("profiles").select("*").order("created_at", { ascending: false }),
  );
}

// ---------------- guardians ----------------
export function listGuardians() {
  return safeList<GuardianRow>((db) =>
    db.from("guardians").select("*").order("full_name", { ascending: true }),
  );
}

// ---------------- professionals ----------------
export function listProfessionals() {
  return safeList<ProfessionalRow>((db) =>
    db.from("professionals").select("*").order("full_name", { ascending: true }),
  );
}

// ---------------- schools ----------------
export function listSchools() {
  return safeList<SchoolRow>((db) =>
    db.from("schools").select("*").order("name", { ascending: true }),
  );
}

// ---------------- tasks ----------------
export function listTasks(childId?: string) {
  return safeList<TaskRow>((db) => {
    let q = db.from("tasks").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getTask(id: string) {
  return safeOne<TaskRow>((db) => db.from("tasks").select("*").eq("id", id).maybeSingle());
}

// ---------------- task_completions ----------------
export function listTaskCompletions(taskId: string) {
  return safeList<TaskCompletionRow>((db) =>
    db.from("task_completions").select("*").eq("task_id", taskId).order("completed_at", { ascending: false }),
  );
}

// ---------------- parent_diary_entries ----------------
export function listDiaryEntries(childId?: string) {
  return safeList<ParentDiaryEntryRow>((db) => {
    let q = db.from("parent_diary_entries").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- neuro_timeline_events ----------------
export function listTimelineEvents(childId?: string) {
  return safeList<NeuroTimelineEventRow>((db) => {
    let q = db.from("neuro_timeline_events").select("*").order("event_date", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- sensory_room_requests ----------------
export function listSensoryRoomRequests() {
  return safeList<SensoryRoomRequestRow>((db) =>
    db.from("sensory_room_requests").select("*").order("created_at", { ascending: false }),
  );
}

// ---------------- genetic_exam_requests ----------------
export function listGeneticExamRequests(childId?: string) {
  return safeList<GeneticExamRequestRow>((db) => {
    let q = db.from("genetic_exam_requests").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- uploaded_documents ----------------
export function listDocuments(childId?: string) {
  return safeList<UploadedDocumentRow>((db) => {
    let q = db.from("uploaded_documents").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

/** Laudos genéticos (uploaded_documents com doc_type = 'laudo_genetico'). */
export function listGeneticReports() {
  return safeList<UploadedDocumentRow>((db) =>
    db
      .from("uploaded_documents")
      .select("*")
      .eq("doc_type", "laudo_genetico")
      .order("created_at", { ascending: false }),
  );
}

// ---------------- screening_reports ----------------
export function listScreeningReports(childId?: string) {
  return safeList<ScreeningReportRow>((db) => {
    let q = db.from("screening_reports").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- mchat_sessions ----------------
export function listMchatSessions(childId?: string) {
  return safeList<MchatSessionRow>((db) => {
    let q = db.from("mchat_sessions").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}
export function getMchatSession(id: string) {
  return safeOne<MchatSessionRow>((db) =>
    db.from("mchat_sessions").select("*").eq("id", id).maybeSingle(),
  );
}

// ---------------- facial_analyses ----------------
export function listFacialAnalyses(childId?: string) {
  return safeList<FacialAnalysisRow>((db) => {
    let q = db.from("facial_analyses").select("*").order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

// ---------------- Triagem Digital Assistiva ----------------
export function listDigitalScreeningSessions(childId?: string) {
  return safeList<DigitalScreeningSessionRow>((db) => {
    let q = db
      .from("digital_screening_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

export function getDigitalScreeningSession(id: string) {
  return safeOne<DigitalScreeningSessionRow>((db) =>
    db.from("digital_screening_sessions").select("*").eq("id", id).maybeSingle(),
  );
}

export function listBehavioralSignals(sessionId: string) {
  return safeList<BehavioralSignalRow>((db) =>
    db
      .from("behavioral_signals")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
  );
}

export function listScreeningFusions(childId?: string) {
  return safeList<ScreeningFusionRow>((db) => {
    let q = db
      .from("screening_fusions")
      .select("*")
      .order("created_at", { ascending: false });
    if (childId) q = q.eq("child_id", childId);
    return q;
  });
}

/** Auditoria operacional de IA — RLS restringe a admin; em outros papéis devolve []. */
export function listAiRequests(limit = 100) {
  return safeList<AiRequestRow>((db) =>
    db
      .from("ai_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}
