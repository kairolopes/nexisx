import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name
  roles: Role[];
  group: string;
}

const ALL: Role[] = ["admin", "responsavel", "profissional", "escola", "consultor"];

export const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: "LayoutDashboard", roles: ALL, group: "Visão geral" },

  // Triagem
  { href: "/app/triagem", label: "Triagem", icon: "ClipboardCheck", roles: ["admin", "responsavel", "profissional"], group: "Triagem" },
  { href: "/app/triagem/analise-facial", label: "Análise facial", icon: "ScanFace", roles: ["admin", "responsavel", "profissional"], group: "Triagem" },
  { href: "/app/triagem/mchat", label: "M-CHAT", icon: "ListChecks", roles: ["admin", "responsavel", "profissional"], group: "Triagem" },
  { href: "/app/triagem/relatorios", label: "Relatórios de triagem", icon: "FileText", roles: ["admin", "responsavel", "profissional"], group: "Triagem" },

  // Acompanhamento
  { href: "/app/criancas", label: "Crianças / Neurodivergentes", icon: "Users", roles: ["admin", "responsavel", "profissional", "escola"], group: "Acompanhamento" },
  { href: "/app/linha-do-tempo", label: "Linha do tempo", icon: "CalendarClock", roles: ["admin", "responsavel", "profissional"], group: "Acompanhamento" },
  { href: "/app/tarefas", label: "Tarefas e rotina", icon: "ListTodo", roles: ["admin", "responsavel", "profissional", "escola"], group: "Acompanhamento" },
  { href: "/app/jogos", label: "Jogos e atividades", icon: "Gamepad2", roles: ["admin", "responsavel", "profissional"], group: "Acompanhamento" },
  { href: "/app/diario", label: "Diário dos pais", icon: "BookHeart", roles: ["admin", "responsavel"], group: "Acompanhamento" },
  { href: "/app/relatorios-evolutivos", label: "Relatórios evolutivos", icon: "LineChart", roles: ["admin", "responsavel", "profissional"], group: "Acompanhamento" },

  // Genética
  { href: "/app/genetica", label: "Exames genéticos", icon: "Dna", roles: ["admin", "responsavel", "profissional", "consultor"], group: "Genética" },
  { href: "/app/laudos", label: "Laudos", icon: "FileSearch", roles: ["admin", "profissional", "consultor"], group: "Genética" },

  // Comercial
  { href: "/app/salas-sensoriais", label: "Salas sensoriais", icon: "Sparkles", roles: ["admin", "consultor"], group: "Comercial" },
  { href: "/app/solicitacoes", label: "Solicitações comerciais", icon: "Inbox", roles: ["admin", "consultor"], group: "Comercial" },

  // Administração
  { href: "/app/responsaveis", label: "Responsáveis", icon: "UserRound", roles: ["admin"], group: "Administração" },
  { href: "/app/profissionais", label: "Profissionais", icon: "Stethoscope", roles: ["admin"], group: "Administração" },
  { href: "/app/escolas", label: "Escolas", icon: "School", roles: ["admin"], group: "Administração" },
  { href: "/app/usuarios", label: "Usuários e permissões", icon: "ShieldCheck", roles: ["admin"], group: "Administração" },
  { href: "/app/configuracoes", label: "Configurações", icon: "Settings", roles: ["admin"], group: "Administração" },
];

export function navForRole(role: Role): NavItem[] {
  return NAV.filter((n) => n.roles.includes(role));
}
