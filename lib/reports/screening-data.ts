// Carregamento do relatório de triagem (server-side, sob RLS) + montagem da view.
// Usado pela página de detalhe e pela rota de PDF. As leituras passam por lib/db/queries
// (cookies → RLS), então o acesso já respeita as políticas do usuário atual.

import {
  getScreeningReport,
  getChild,
  getMchatSession,
  getFacialAnalysis,
} from "@/lib/db/queries";
import { buildScreeningReportView, type ScreeningReportView } from "./screening";

export async function loadScreeningReportView(id: string): Promise<ScreeningReportView | null> {
  const report = await getScreeningReport(id);
  if (!report) return null;

  const [child, mchat, facial] = await Promise.all([
    report.child_id ? getChild(report.child_id) : Promise.resolve(null),
    report.mchat_session_id ? getMchatSession(report.mchat_session_id) : Promise.resolve(null),
    report.facial_analysis_id ? getFacialAnalysis(report.facial_analysis_id) : Promise.resolve(null),
  ]);

  return buildScreeningReportView({ report, child, mchat, facial });
}
