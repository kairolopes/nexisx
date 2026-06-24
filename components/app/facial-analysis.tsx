"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Loader2, ScanFace } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/site/notice";

type Status = "idle" | "ready" | "analyzing" | "done";

export function FacialAnalysis() {
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus("ready");
  }

  function analyze() {
    setStatus("analyzing");
    setTimeout(() => setStatus("done"), 2200);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload da foto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pré-visualização" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <span className="text-sm">Clique para enviar uma foto</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            <span className="text-muted-foreground">
              Declaro ter lido o termo de consentimento e autorizo o uso da imagem para fins
              de triagem assistida.
            </span>
          </label>

          <Button
            variant="gradient"
            className="w-full"
            disabled={status !== "ready" || !consent}
            onClick={analyze}
          >
            {status === "analyzing" && <Loader2 className="h-4 w-4 animate-spin" />}
            <ScanFace className="h-4 w-4" /> Analisar imagem
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado preliminar</CardTitle>
        </CardHeader>
        <CardContent>
          <Notice className="mb-5">
            A análise facial não fecha diagnóstico. Ela apenas auxilia na identificação de
            possíveis sinais e na orientação para investigação profissional.
          </Notice>

          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="success">Análise concluída</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sinais observados</span>
                  <Badge variant="warning">Atenção moderada</Badge>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Observações</p>
                  <p className="mt-1">
                    Resultado ilustrativo. Recomenda-se complementar com o M-CHAT e
                    encaminhar para avaliação de profissional habilitado.
                  </p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4 text-sm">
                  <p className="font-medium text-primary">Recomendação de encaminhamento</p>
                  <p className="mt-1 text-muted-foreground">
                    Avaliação com neuropediatra e/ou psicólogo especializado.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
              >
                {status === "analyzing" ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-3 text-sm">Processando imagem...</p>
                  </>
                ) : (
                  <p className="text-sm">Envie uma foto e autorize para iniciar a análise.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
