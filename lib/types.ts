export type Role = "admin" | "responsavel" | "profissional" | "escola" | "consultor";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  responsavel: "Responsável",
  profissional: "Profissional",
  escola: "Escola",
  consultor: "Consultor",
};

export type RiskLevel = "baixo" | "moderado" | "alto";

export const RISK_LABELS: Record<RiskLevel, string> = {
  baixo: "Baixo risco",
  moderado: "Risco moderado",
  alto: "Alto risco",
};

export type TaskStatus = "pendente" | "em_andamento" | "concluida";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_id: string;
  school_id: string | null;
  notes: string | null;
  created_at: string;
}
