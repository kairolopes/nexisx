"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Loader2, Video, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Notice } from "@/components/site/notice";
import { EmptyState } from "@/components/app/empty-state";
import { useToast } from "@/components/ui/toast";
import { createDigitalScreening } from "@/lib/actions/screening";
import type {
  BehavioralSignalKind,
  BehavioralSignalResult,
  RiskLevel,
  ScreeningFusionOutput,
  ScreeningRecommendation,
} from "@/lib/ai";

interface ChildOption {
  id: string;
  full_name: string;
}

interface ScreeningResult {
  sessionId: string;
  mediaKind: "video" | "photo";
  captureQuality: number;
  riskScore: number;
  riskLevel: RiskLevel;
  predictionConfidence: number;
  recommendation: ScreeningRecommendation;
  recaptureRequired: boolean;
  explanation: string;
  signals: BehavioralSignalResult[];
  fusion: ScreeningFusionOutput | null;
}

type Status = "idle" | "ready" | "processing" | "done";

const SIGNAL_LABELS: Record<BehavioralSignalKind, string> = {
  social_attention: "Atenção social",
  gaze: "Direção do olhar",
  head_movement: "Movimentos de cabeça",
  facial_expression: "Expressões faciais",
  response_to_name: "Resposta ao nome",
  blink_rate: "Taxa de piscar",
  motor_behavior: "Comportamentos motores",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  baixo: "Risco baixo",
  moderado: "Risco moderado",
  alto: "Risco alto",
};

function riskVariant(level: RiskLevel): "success" | "warning" | "danger" {
  return level === "baixo" ? "success" : level === "moderado" ? "warning" : "danger";
}

const RECOMMENDATION_LABEL: Record<ScreeningRecommendation, string> = {
  encaminhar: "Encaminhar para avaliação",
  acompanhar: "Acompanhar",
  repetir_coleta: "Repetir a coleta",
};

function pct(n: number): number {
  return Math.round(Math.min(1, Math.max(0, n)) * 100);
}

export function BehavioralScreening({ childOptions }: { childOptions: ChildOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [durationSec, setDurationSec] = useState(10);
  const [nameCallSec, setNameCallSec] = useState("2");
  const [visualSec, setVisualSec] = useState("");
  const [consent, setConsent] = useState(false);
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasChild = childOptions.length > 0;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setResult(null);
    setFile(f);
    setStatus("ready");

    const vid = f.type.startsWith("video/");
    setIsVideo(vid);
    if (vid) {
      // Detecta a duração da coleta a partir dos metadados do vídeo (limite de 60s).
      const url = URL.createObjectURL(f);
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        const secs = Math.round(probe.duration || 0);
        setDurationSec(secs > 0 ? Math.min(60, secs) : 10);
        URL.revokeObjectURL(url);
      };
      probe.src = url;
    }
  }

  function submit() {
    setError(null);
    if (!file || !childId) {
      setError("Selecione a criança e uma mídia da coleta.");
      return;
    }
    setStatus("processing");
    startTransition(async () => {
      const form = new FormData();
      form.set("childId", childId);
      form.set("consent", "true");
      form.set("file", file);
      if (isVideo) {
        form.set("durationMs", String(Math.round(durationSec * 1000)));
        if (nameCallSec !== "") form.set("nameCallMs", String(Math.round(Number(nameCallSec) * 1000)));
        if (visualSec !== "") form.set("visualMs", String(Math.round(Number(visualSec) * 1000)));
      }
      const res = await createDigitalScreening(form);
      setStatus("done");
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setResult(res.data as ScreeningResult);
      toast.success(
        res.data.recaptureRequired
          ? "Coleta processada — qualidade baixa, recomenda-se repetir."
          : "Triagem comportamental processada.",
      );
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Coleta */}
      <Card>
        <CardHeader>
          <CardTitle>Coleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50">
            {file ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <Video className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
                <span className="text-xs">
                  {isVideo ? "Vídeo da coleta" : "Foto da coleta (fallback)"}
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">Enviar vídeo curto (até 60s) ou foto</span>
              </>
            )}
            <input
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={onFile}
            />
          </label>

          {childOptions.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="b-child">Criança</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger id="b-child">
                  <SelectValue placeholder="Selecione a criança" />
                </SelectTrigger>
                <SelectContent>
                  {childOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isVideo && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="b-duration">Duração (s)</Label>
                <Input
                  id="b-duration"
                  type="number"
                  min={1}
                  max={60}
                  value={durationSec}
                  onChange={(e) => setDurationSec(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-name">Chamar nome (s)</Label>
                <Input
                  id="b-name"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="ex.: 2"
                  value={nameCallSec}
                  onChange={(e) => setNameCallSec(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-visual">Estímulo visual (s)</Label>
                <Input
                  id="b-visual"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="ex.: 8"
                  value={visualSec}
                  onChange={(e) => setVisualSec(e.target.value)}
                />
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            <span className="text-muted-foreground">
              Declaro ter lido o termo de consentimento e autorizo o uso da mídia para fins
              de triagem assistida do neurodesenvolvimento.
            </span>
          </label>

          <Button
            variant="gradient"
            className="w-full"
            disabled={status === "idle" || status === "processing" || !consent || !hasChild || pending}
            onClick={submit}
          >
            {status === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Processar triagem
          </Button>
          {!hasChild && (
            <p className="text-xs text-muted-foreground">
              Sem criança vinculada à sua conta, não é possível registrar a coleta.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado da triagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Notice className="mb-5">
            Isto é uma <strong>triagem assistiva</strong> — não é diagnóstico, não confirma
            nem descarta condição alguma e não substitui avaliação profissional. Os
            resultados devem ser interpretados por profissional habilitado. Se a qualidade
            da coleta for baixa, repita a gravação.
          </Notice>

          <AnimatePresence mode="wait">
            {status === "done" && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Cabeçalho de status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status da coleta</span>
                  <Badge variant={result.recaptureRequired ? "warning" : "success"}>
                    {result.recaptureRequired ? "Qualidade baixa" : "Coleta concluída"}
                  </Badge>
                </div>

                {/* Qualidade da coleta */}
                <Metric label="Qualidade da coleta" value={pct(result.captureQuality)} />

                {result.recaptureRequired && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Qualidade da coleta insuficiente para uma triagem confiável.
                      Recomenda-se repetir a gravação.
                    </span>
                  </div>
                )}

                {/* Risco e confiança */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nível de risco de triagem</span>
                  <Badge variant={riskVariant(result.riskLevel)}>
                    {RISK_LABEL[result.riskLevel]}
                  </Badge>
                </div>
                <Metric label="Score de risco" value={pct(result.riskScore)} />
                <Metric label="Confiança da predição" value={pct(result.predictionConfidence)} />

                {/* Recomendação */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recomendação</span>
                  <Badge variant={result.recommendation === "encaminhar" ? "danger" : "default"}>
                    {RECOMMENDATION_LABEL[result.recommendation]}
                  </Badge>
                </div>

                {/* Sinais comportamentais */}
                {result.signals.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Sinais (indicadores)</p>
                    {result.signals.map((s) => (
                      <div key={s.signal} className="rounded-xl border border-border p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {SIGNAL_LABELS[s.signal]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            confiança {pct(s.confidence)}%
                          </span>
                        </div>
                        <Progress value={pct(s.indicator)} className="mt-2" />
                        <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explicabilidade */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Interpretação</p>
                  <p className="mt-1">{result.explanation}</p>
                </div>

                {/* Fusão com M-CHAT */}
                {result.fusion && (
                  <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Fusão com o M-CHAT
                      </p>
                      <Badge variant={riskVariant(result.fusion.combinedRisk)}>
                        {RISK_LABEL[result.fusion.combinedRisk]}
                      </Badge>
                    </div>
                    <Metric
                      label="Confiança combinada"
                      value={pct(result.fusion.combinedConfidence)}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Recomendação combinada</span>
                      <Badge
                        variant={result.fusion.recommendation === "encaminhar" ? "danger" : "default"}
                      >
                        {RECOMMENDATION_LABEL[result.fusion.recommendation]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{result.fusion.rationale}</p>
                  </div>
                )}

                {error && <p className="text-xs text-destructive">{error}</p>}
              </motion.div>
            ) : status === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm">Processando a coleta e os sinais...</p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  icon={Activity}
                  title="Nenhuma triagem processada"
                  description="Envie a mídia da coleta, registre o consentimento e processe a triagem para ver os sinais e a recomendação de encaminhamento."
                />
                {error && <p className="mt-3 text-center text-xs text-destructive">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
