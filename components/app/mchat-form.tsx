"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Save } from "lucide-react";
import { MCHAT_QUESTIONS, scoreMchat } from "@/lib/mchat";
import { RISK_LABELS, type RiskLevel } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Notice } from "@/components/site/notice";

type Answers = Record<number, "yes" | "no">;
const STORAGE = "nexisx:mchat";

const riskVariant: Record<RiskLevel, "success" | "warning" | "danger"> = {
  baixo: "success",
  moderado: "warning",
  alto: "danger",
};

export function MchatForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  // salvamento automático
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Answers;
        setAnswers(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE, JSON.stringify(answers));
    }
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
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE);
  }

  if (done) {
    const { score, risk } = scoreMchat(answers);
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">Resultado do M-CHAT</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pontuação de risco: <strong>{score}</strong> / {total}
            </p>
            <Badge variant={riskVariant[risk]} className="mt-4 text-sm">
              {RISK_LABELS[risk]}
            </Badge>
          </div>

          <Notice className="mt-8">
            O M-CHAT é instrumento de triagem, não diagnóstico.
          </Notice>

          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Refazer
            </Button>
            <Button variant="gradient">
              <Save className="h-4 w-4" /> Salvar no relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Pergunta {step + 1} de {total}
        </span>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Item {q.id}
              </span>
              <p className="mt-3 font-display text-xl font-semibold leading-snug">{q.text}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button
                  variant={answers[q.id] === "yes" ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => answer("yes")}
                >
                  Sim
                </Button>
                <Button
                  variant={answers[q.id] === "no" ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => answer("no")}
                >
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
