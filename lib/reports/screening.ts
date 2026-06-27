// Montagem do relatório de triagem (modelo de apresentação).
// Função PURA: recebe linhas já lidas do banco e devolve uma estrutura normalizada
// usada TANTO pela página de detalhe QUANTO pela exportação em PDF — garantindo que
// os dois mostrem exatamente o mesmo conteúdo. Sem acesso a banco/IO (testável).

import type {
  ScreeningReportRow,
  ChildRow,
  MchatSessionRow,
  FacialAnalysisRow,
} from "@/lib/db/types";

export const PRIORITY_LABEL: Record<string, string> = {
  baixo: "Baixa",
  moderado: "Moderada",
  alto: "Alta",
};

export const RISK_LABEL: Record<string, string> = {
  baixo: "Baixo",
  moderado: "Moderado",
  alto: "Alto",
};

export interface ScreeningReportView {
  id: string;
  childName: string;
  generatedAt: string;
  priorityValue: string | null;
  priorityLabel: string | null;
  recommendation: string | null;
  nextSteps: string | null;
  mchat: {
    score: number | null;
    riskValue: string | null;
    riskLabel: string | null;
    completedAt: string | null;
  } | null;
  facial: {
    status: string;
    result: string | null;
    observations: string | null;
  } | null;
}

export interface ScreeningReportSources {
  report: ScreeningReportRow;
  child: ChildRow | null;
  mchat: MchatSessionRow | null;
  facial: FacialAnalysisRow | null;
}

/** Aviso legal obrigatório — replicado na UI e no PDF. */
export const SCREENING_DISCLAIMER =
  "Este é um relatório PRELIMINAR de triagem. NÃO constitui diagnóstico nem " +
  "substitui a avaliação de profissionais habilitados (neuropediatra, psicólogo, " +
  "geneticista). Use-o apenas como apoio para orientar os próximos passos.";

export function buildScreeningReportView({
  report,
  child,
  mchat,
  facial,
}: ScreeningReportSources): ScreeningReportView {
  return {
    id: report.id,
    childName: child?.full_name ?? "Triagem sem criança vinculada",
    generatedAt: report.created_at,
    priorityValue: report.priority,
    priorityLabel: report.priority ? PRIORITY_LABEL[report.priority] ?? report.priority : null,
    recommendation: report.recommendation,
    nextSteps: report.next_steps,
    mchat: mchat
      ? {
          score: mchat.score,
          riskValue: mchat.risk,
          riskLabel: mchat.risk ? RISK_LABEL[mchat.risk] ?? mchat.risk : null,
          completedAt: mchat.completed_at,
        }
      : null,
    facial: facial
      ? {
          status: facial.status,
          result: facial.result,
          observations: facial.observations,
        }
      : null,
  };
}
