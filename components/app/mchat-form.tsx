"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Save, Loader2, FileDown } from "lucide-react";
import { MCHAT_QUESTIONS, scoreMchat } from "@/lib/mchat";
import { RISK_LABELS, type RiskLevel } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Notice } from "@/components/site/notice";
import { saveMchatSession } from "@/lib/actions/mchat";
import { createScreeningReport } from "@/lib/actions/screening";
import { useToast } from "@/components/ui/toast";

type Answers = Record<number, "yes" | "no">;
const STORAGE = "nexisx:mchat";

const riskVariant: Record<RiskLevel, "success" | "warning" | "danger"> = {
  baixo: "success",
  moderado: "warning",
  alto: "danger",
};

interface ChildOption {
  id: string;
  full_name: string;
}

export function MchatForm({
  childOptions,
  canCreateReport,
}: {
  childOptions: ChildOption[];
  canCreateReport: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE) : null;
    if (raw) {
      try {
        setAnswers(JSON.parse(raw) as Answers);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE, JSON.stringify(answers));
  }, [answers]);

  const total = MCHAT_QUESTIONS.length;
  const answered = Object.keys(answers).length;
  const q = MCHAT_QUESTIONS[step];

  function answer(value: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setTimeout(() => {
      if (step < total - 1) setStep((s) => s + 1);
      else setDone(true);
    }, 180);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setDone(false);
    setSaved(false);
    setError(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE);
  }

  function save(score: number, risk: RiskLevel) {
    setError(null);
    startTransition(async () => {
      const payload = {
        child_id: childId,
        score,
        risk,
        answers: Object.entries(answers).map(([id, a]) => ({
          question_id: Number(id),
          answer: a,
        })),
      };
      const res = await saveMchatSession(payload);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      if (canCreateReport) {
        const reportRes = await createScreeningReport({
          child_id: childId,
          mchat_session_id: res.data.id,
          priority: risk,
          recommendation:
            "Resultado de triagem M-CHAT. Recomenda-se avaliação de profissional habilitado.",
        });
        if (reportRes.ok) setReportId(reportRes.data.id);
      }
      setSaved(true);
      toast.success("Resultado salvo no acompanhamento.");
      router.refresh();
    });
  }

  if (done) {
    const { score, risk } = scoreMchat(answers);
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500"
            >
              <Check className="h-8 w-8" />
            </motion.div>
            <h3 className="mt-4 font-display text-2xl font-bold">Resultado do M-CHAT</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pontuação de risco: <strong>{score}</strong> / {total}
            </p>
            <Badge variant={riskVariant[risk]} className="mt-4 text-sm">
              {RISK_LABELS[risk]}
            </Badge>
          </div>

          <Notice className="mt-8">O M-CHAT é instrumento de triagem, não diagnóstico.</Notice>

          {saved ? (
            <div className="mt-6 space-y-3 text-center">
              <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                Sessão salva no acompanhamento.
              </p>
              {reportId && (
                <a
                  href={`/app/triagem/relatorios/${reportId}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <FileDown className="h-4 w-4" /> Baixar PDF do relatório
                </a>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {childOptions.length === 0 ? (
                <p className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                  Vincule uma criança à sua conta para salvar este resultado.
                </p>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="m-child">Criança</Label>
                  <select
                    id="m-child"
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm"
                  >
                    {childOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Refazer
                </Button>
                <Button
                  variant="gradient"
                  disabled={pending || childOptions.length === 0}
                  onClick={() => save(score, risk)}
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar no relatório
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Pergunta {step + 1} de {total}</span>
        <span>{answered} respondidas</span>
      </div>
      <Progress value={((step + 1) / total) * 100} />

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Item {q.id}</span>
              <p className="mt-3 font-display text-xl font-semibold leading-snug">{q.text}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button variant={answers[q.id] === "yes" ? "gradient" : "outline"} size="lg" onClick={() => answer("yes")}>
                  Sim
                </Button>
                <Button variant={answers[q.id] === "no" ? "gradient" : "outline"} size="lg" onClick={() => answer("no")}>
                  Não
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Anterior
        </Button>
        <span className="text-xs text-muted-foreground">
          <Save className="mr-1 inline h-3 w-3" /> Salvamento automático ativo
        </span>
      </div>
    </div>
  );
}
