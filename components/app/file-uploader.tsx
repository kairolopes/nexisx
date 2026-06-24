"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadGeneticReportDoc, uploadChildDocumentDoc } from "@/lib/actions/uploads";

interface ChildOption {
  id: string;
  full_name: string;
}

const DOC_TYPES = [
  "Relatório médico",
  "Relatório escolar",
  "Avaliação terapêutica",
  "Documento complementar",
];

/**
 * Uploader genérico para laudos genéticos (kind="genetic") ou documentos da criança
 * (kind="document"). Envia via FormData para a Server Action correspondente.
 */
export function FileUploader({
  childOptions,
  kind,
}: {
  childOptions: ChildOption[];
  kind: "genetic" | "document";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept =
    kind === "genetic" ? ".pdf,.jpg,.jpeg,.png,.webp" : ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

  if (childOptions.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-8 text-center text-sm text-muted-foreground">
          Nenhuma criança disponível para anexar arquivos.
        </CardContent>
      </Card>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }
    const form = new FormData();
    form.set("childId", childId);
    form.set("file", file);
    if (kind === "document") form.set("docType", docType);

    startTransition(async () => {
      const res =
        kind === "genetic"
          ? await uploadGeneticReportDoc(form)
          : await uploadChildDocumentDoc(form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOkMsg("Arquivo enviado com segurança.");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="u-child">Criança</Label>
            <select
              id="u-child"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm"
            >
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {kind === "document" && (
            <div className="space-y-2">
              <Label htmlFor="u-type">Tipo de documento</Label>
              <select
                id="u-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="u-file">Arquivo</Label>
            <Input id="u-file" ref={inputRef} type="file" accept={accept} />
            <p className="text-xs text-muted-foreground">
              {kind === "genetic" ? "PDF ou imagem, até 20 MB." : "PDF, DOC ou imagem, até 20 MB."}
            </p>
          </div>

          {error && <p className="sm:col-span-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          {okMsg && <p className="sm:col-span-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{okMsg}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" variant="gradient" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Enviar arquivo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
