"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Loader2, ScanFace } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Notice } from "@/components/site/notice";
import { submitFacialAnalysis } from "@/lib/actions/uploads";
import { useToast } from "@/components/ui/toast";

type Status = "idle" | "ready" | "analyzing" | "done";

interface ChildOption {
  id: string;
  full_name: string;
}

export function FacialAnalysis({ childOptions }: { childOptions: ChildOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hasChild = childOptions.length > 0;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("ready");
  }

  function analyze() {
    setError(null);
    if (!file || !childId) {
      setError("Selecione uma foto e uma criança.");
      return;
    }
    setStatus("analyzing");
    // Resultado da análise permanece SIMULADO (sem IA). O upload da foto é real:
    // envia para o bucket facial-photos e salva o storage_path em facial_analyses.
    setTimeout(() => {
      startTransition(async () => {
        const form = new FormData();
        form.set("childId", childId);
        form.set("consent", "true");
        form.set("file", file);
        const res = await submitFacialAnalysis(form);
        setStatus("done");
        if (!res.ok) {
          setError(res.error);
          toast.error(res.error);
        } else {
          setSaved(true);
          toast.success("Foto enviada e análise registrada.");
          router.refresh();
        }
      });
    }, 1500);
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

          {childOptions.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="f-child">Criança</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger id="f-child">
                  <SelectValue placeholder="Selecione a criança" />
                </SelectTrigger>
                <SelectContent>
                  {childOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Declaro ter lido o termo de consentimento e autorizo o uso da imagem para fins
              de triagem assistida.
            </span>
          </label>

          <Button
            variant="gradient"
            className="w-full"
            disabled={status !== "ready" || !consent || !hasChild || pending}
            onClick={analyze}
          >
            {status === "analyzing" && <Loader2 className="h-4 w-4 animate-spin" />}
            <ScanFace className="h-4 w-4" /> Analisar imagem
          </Button>
          {!hasChild && (
            <p className="text-xs text-muted-foreground">
              Sem criança vinculada à sua conta, não é possível registrar a análise.
            </p>
          )}
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
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">Foto recebida</Badge>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Análise pendente de avaliação profissional</p>
                  <p className="mt-1 text-amber-700 dark:text-amber-400">
                    A foto foi registrada com sucesso. A análise automatizada ainda não está
                    disponível — um profissional habilitado deverá avaliar as imagens e inserir
                    as observações clínicas manualmente.
                  </p>
                </div>
                {pending && <p className="text-xs text-muted-foreground">Registrando análise...</p>}
                {saved && <p className="text-xs text-emerald-600">Foto registrada no acompanhamento.</p>}
                {error && <p className="text-xs text-destructive">{error}</p>}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
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
