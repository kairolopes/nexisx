// Tipos das linhas das tabelas do Supabase (espelham supabase/schema.sql).
// Fonte única de tipos do banco — importe daqui em queries, actions e telas.
// Em fase futura podem ser substituídos pela geração automática do Supabase CLI.

import type { Role, RiskLevel, TaskStatus } from "@/lib/types";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface GuardianRow {
  id: string;
  profile_id: string | null;
  full_name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface ProfessionalRow {
  id: string;
  profile_id: string | null;
  full_name: string;
  specialty: string | null;
  registration: string | null;
  created_at: string;
}

export interface SchoolRow {
  id: string;
  profile_id: string | null;
  name: string;
  city: string | null;
  contact_email: string | null;
  created_at: string;
}

export interface ChildRow {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_id: string | null;
  school_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface FacialAnalysisRow {
  id: string;
  child_id: string | null;
  image_path: string | null;
  consent: boolean;
  status: string;
  result: string | null;
  observations: string | null;
  recommendation: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MchatSessionRow {
  id: string;
  child_id: string | null;
  score: number | null;
  risk: RiskLevel | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MchatAnswerRow {
  id: string;
  session_id: string | null;
  question_id: number;
  answer: "yes" | "no";
}

export interface ScreeningReportRow {
  id: string;
  child_id: string | null;
  facial_analysis_id: string | null;
  mchat_session_id: string | null;
  priority: string | null;
  recommendation: string | null;
  next_steps: string | null;
  created_at: string;
}

export interface TaskRow {
  id: string;
  child_id: string | null;
  title: string;
  category: string | null;
  cadence: string | null;
  points: number;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
}

export interface TaskCompletionRow {
  id: string;
  task_id: string | null;
  completed_at: string;
  completed_by: string | null;
}

export interface ParentDiaryEntryRow {
  id: string;
  child_id: string | null;
  mood: string | null;
  sleep: string | null;
  feeding: string | null;
  crisis: string | null;
  triggers: string | null;
  achievements: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NeuroTimelineEventRow {
  id: string;
  child_id: string | null;
  kind: string | null;
  title: string;
  description: string | null;
  event_date: string;
  created_by: string | null;
}

export interface SensoryRoomRequestRow {
  id: string;
  requester_name: string;
  email: string | null;
  phone: string | null;
  environment: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export interface GeneticExamRequestRow {
  id: string;
  child_id: string | null;
  exam_type: string | null;
  status: string;
  family_summary: string | null;
  technical_summary: string | null;
  created_by: string | null;
  created_at: string;
}

export interface UploadedDocumentRow {
  id: string;
  child_id: string | null;
  file_path: string;
  doc_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ───────────────────────── Triagem Digital Assistiva ──────────────────────────
// Análise Comportamental Digital (vídeo + M-CHAT). Espelham supabase/screening_digital.sql.

export type DigitalScreeningStatus =
  | "pendente"
  | "processando"
  | "concluido"
  | "erro"
  | "baixa_qualidade";

export type ScreeningRecommendation =
  | "encaminhar"
  | "repetir_coleta"
  | "acompanhar";

export interface DigitalScreeningSessionRow {
  id: string;
  child_id: string | null;
  media_kind: "video" | "photo";
  media_path: string | null;
  consent: boolean;
  capture_quality: number | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  prediction_confidence: number | null;
  recommendation: ScreeningRecommendation | null;
  recapture_required: boolean;
  status: DigitalScreeningStatus;
  provider: string | null;
  model: string | null;
  prompt_version: string | null;
  request_id: string | null;
  latency_ms: number | null;
  estimated_cost: number | null;
  processed_at: string | null;
  error_reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BehavioralSignalRow {
  id: string;
  session_id: string | null;
  child_id: string | null;
  signal: string;
  indicator: number | null;
  confidence: number | null;
  note: string | null;
  created_at: string;
}

export interface ScreeningFusionRow {
  id: string;
  child_id: string | null;
  session_id: string | null;
  mchat_session_id: string | null;
  combined_risk: RiskLevel | null;
  combined_confidence: number | null;
  recommendation: ScreeningRecommendation | null;
  rationale: string | null;
  created_at: string;
}

export interface AppSettingRow {
  key: string;
  value: string;
  updated_at: string;
}

export interface GameSessionRow {
  id: string;
  game_id: string | null;
  child_id: string | null;
  score: number;
  phase: number;
  played_at: string;
}

export interface AiRequestRow {
  id: string;
  provider: string;
  model: string;
  capability: string;
  prompt_version: string | null;
  request_id: string | null;
  duration_ms: number | null;
  estimated_cost: number | null;
  success: boolean;
  error: string | null;
  child_id: string | null;
  created_at: string;
}
