import { describe, it, expect } from "vitest";
import { MockProvider } from "@/lib/ai/providers/mock";
import { analyzeBehavioralScreening } from "@/lib/ai/behavioral/service";
import { fuseScreening } from "@/lib/ai/behavioral/fusion";
import { assessCaptureQuality } from "@/lib/ai/behavioral/capture-quality";
import { runBehavioralPipeline } from "@/lib/ai/behavioral/pipeline";
import {
  BEHAVIORAL_SIGNALS,
  type BehavioralScreeningInput,
  type BehavioralScreeningOutput,
} from "@/lib/ai/core/types";

const RISK = ["baixo", "moderado", "alto"];
const RECS = ["encaminhar", "repetir_coleta", "acompanhar"];

function videoInput(durationMs = 12_000, fill = 7): BehavioralScreeningInput {
  return {
    mediaKind: "video",
    media: { bytes: new Uint8Array(4096).fill(fill), mimeType: "video/mp4", durationMs },
  };
}

function assertValidOutput(out: BehavioralScreeningOutput) {
  expect(out.schemaVersion).toBe(1);
  expect(out.disclaimerRequired).toBe(true);
  expect(RISK).toContain(out.riskLevel);
  expect(RECS).toContain(out.recommendation);
  for (const v of [out.captureQuality, out.riskScore, out.predictionConfidence]) {
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  }
}

describe("MockProvider", () => {
  const provider = new MockProvider();

  it("declara as capacidades suportadas e nega desconhecidas", () => {
    expect(provider.supports("behavioral.digitalScreening")).toBe(true);
    expect(provider.supports("text.geneticSummary")).toBe(true);
    // capacidade inexistente
    expect(provider.supports("foo.bar" as never)).toBe(false);
  });

  it("behavioralScreening respeita o contrato e não lança", async () => {
    const out = await provider.behavioralScreening(videoInput(), { requestId: "t1" });
    assertValidOutput(out);
    expect(out.signals.length).toBeGreaterThan(0);
  });
});

describe("runBehavioralPipeline (fluxo mock ponta a ponta, sem provider real)", () => {
  it("produz um resultado válido para vídeo de boa qualidade", async () => {
    const out = await runBehavioralPipeline(videoInput(), { requestId: "p1" });
    assertValidOutput(out);
    // Todos os sinais retornados pertencem ao conjunto conhecido.
    for (const s of out.signals) expect(BEHAVIORAL_SIGNALS).toContain(s.signal);
  });

  it("é determinístico: mesma mídia → mesma saída", async () => {
    const a = await runBehavioralPipeline(videoInput(10_000, 9), { requestId: "x" });
    const b = await runBehavioralPipeline(videoInput(10_000, 9), { requestId: "y" });
    expect(a).toEqual(b);
  });
});

describe("analyzeBehavioralScreening (envelope Result, nunca lança)", () => {
  it("retorna ok=true para coleta de boa qualidade", async () => {
    const r = await analyzeBehavioralScreening(videoInput(), { requestId: "r1" });
    expect(r.ok).toBe(true);
    if (r.ok) assertValidOutput(r.data);
  });

  it("mídia vazia → ok=true com recomendação de repetir coleta (porteiro)", async () => {
    const r = await analyzeBehavioralScreening(
      { mediaKind: "video", media: { bytes: new Uint8Array(0), mimeType: "video/mp4" } },
      { requestId: "r2" },
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.recaptureRequired).toBe(true);
      expect(r.data.recommendation).toBe("repetir_coleta");
      expect(r.data.signals).toHaveLength(0);
    }
  });
});

describe("assessCaptureQuality", () => {
  it("mídia vazia → score 0 e recaptura obrigatória", () => {
    const q = assessCaptureQuality({
      mediaKind: "video",
      media: { bytes: new Uint8Array(0), mimeType: "video/mp4" },
    });
    expect(q.score).toBe(0);
    expect(q.recaptureRequired).toBe(true);
    expect(q.reasons.length).toBeGreaterThan(0);
  });

  it("vídeo muito curto reduz a qualidade e gera motivo", () => {
    const q = assessCaptureQuality(videoInput(1_000));
    expect(q.reasons.some((r) => /curto/i.test(r))).toBe(true);
  });
});

describe("fuseScreening", () => {
  it("sem dados → risco baixo, confiança 0 e repetir coleta", () => {
    const f = fuseScreening({});
    expect(f.combinedRisk).toBe("baixo");
    expect(f.combinedConfidence).toBe(0);
    expect(f.recommendation).toBe("repetir_coleta");
  });

  it("apenas M-CHAT alto → risco alto e encaminhar", () => {
    const f = fuseScreening({ mchat: { score: 10, risk: "alto" } });
    expect(f.combinedRisk).toBe("alto");
    expect(f.recommendation).toBe("encaminhar");
  });

  it("divergência adota o maior risco (prudência)", () => {
    const behavioral: BehavioralScreeningOutput = {
      schemaVersion: 1,
      captureQuality: 0.8,
      riskScore: 0.2,
      riskLevel: "baixo",
      predictionConfidence: 0.7,
      signals: [],
      explanation: "x",
      recommendation: "acompanhar",
      recaptureRequired: false,
      disclaimerRequired: true,
    };
    const f = fuseScreening({ behavioral, mchat: { score: 9, risk: "alto" } });
    expect(f.combinedRisk).toBe("alto");
    expect(f.disclaimerRequired).toBe(true);
  });
});
