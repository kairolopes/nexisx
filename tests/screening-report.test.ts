import { describe, it, expect } from "vitest";
import { buildScreeningReportView } from "@/lib/reports/screening";
import { buildScreeningReportPdf } from "@/lib/reports/screening-pdf";
import type {
  ScreeningReportRow,
  ChildRow,
  MchatSessionRow,
  FacialAnalysisRow,
} from "@/lib/db/types";

const baseReport: ScreeningReportRow = {
  id: "r1",
  child_id: "c1",
  facial_analysis_id: null,
  mchat_session_id: null,
  priority: "alto",
  recommendation: "Encaminhar para neuropediatra.",
  next_steps: "Agendar avaliação em 30 dias.",
  created_at: "2026-06-26T12:00:00.000Z",
};

const child: ChildRow = {
  id: "c1",
  full_name: "Helena",
  birth_date: "2022-01-01",
  guardian_id: null,
  school_id: null,
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("buildScreeningReportView", () => {
  it("monta a view com rótulos de prioridade traduzidos", () => {
    const view = buildScreeningReportView({ report: baseReport, child, mchat: null, facial: null });
    expect(view.childName).toBe("Helena");
    expect(view.priorityValue).toBe("alto");
    expect(view.priorityLabel).toBe("Alta");
    expect(view.recommendation).toBe("Encaminhar para neuropediatra.");
    expect(view.mchat).toBeNull();
    expect(view.facial).toBeNull();
  });

  it("usa fallback quando não há criança vinculada", () => {
    const view = buildScreeningReportView({
      report: { ...baseReport, child_id: null, priority: null },
      child: null,
      mchat: null,
      facial: null,
    });
    expect(view.childName).toBe("Triagem sem criança vinculada");
    expect(view.priorityLabel).toBeNull();
  });

  it("inclui M-CHAT e análise facial quando presentes", () => {
    const mchat: MchatSessionRow = {
      id: "m1",
      child_id: "c1",
      score: 9,
      risk: "alto",
      completed_at: "2026-06-26T11:00:00.000Z",
      created_by: null,
      created_at: "2026-06-26T11:00:00.000Z",
    };
    const facial: FacialAnalysisRow = {
      id: "f1",
      child_id: "c1",
      image_path: "c1/abc.jpg",
      consent: true,
      status: "recebida",
      result: "Pendente de avaliação profissional",
      observations: null,
      recommendation: null,
      created_by: null,
      created_at: "2026-06-26T10:00:00.000Z",
    };
    const view = buildScreeningReportView({ report: baseReport, child, mchat, facial });
    expect(view.mchat?.score).toBe(9);
    expect(view.mchat?.riskLabel).toBe("Alto");
    expect(view.facial?.status).toBe("recebida");
    expect(view.facial?.result).toBe("Pendente de avaliação profissional");
  });

  it("gera um PDF válido (magic bytes %PDF-)", async () => {
    const view = buildScreeningReportView({ report: baseReport, child, mchat: null, facial: null });
    const bytes = await buildScreeningReportPdf(view);
    expect(bytes.length).toBeGreaterThan(800);
    const header = String.fromCharCode(...Array.from(bytes.slice(0, 5)));
    expect(header).toBe("%PDF-");
  });
});
