"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateGeneticExamRequest } from "@/lib/actions/genetic";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { GeneticExamRequestRow } from "@/lib/db/types";

const STATUS_OPTIONS = [
  { value: "solicitado", label: "Solicitado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
] as const;

function statusVariant(s: string): "warning" | "secondary" | "success" | "danger" {
  if (s === "concluido") return "success";
  if (s === "cancelado") return "danger";
  if (s === "em_andamento") return "secondary";
  return "warning";
}
function statusLabel(s: string): string {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

export function GeneticExamList({
  requests,
  canManage,
}: {
  requests: GeneticExamRequestRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("solicitado");
  const [family, setFamily] = useState("");
  const [technical, setTechnical] = useState("");

  function onEdit(r: GeneticExamRequestRow) {
    setError(null);
    setEditingId(r.id);
    setStatus(r.status ?? "solicitado");
    setFamily(r.family_summary ?? "");
    setTechnical(r.technical_summary ?? "");
  }

  function onSave(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateGeneticExamRequest({
        id,
        status,
        family_summary: family,
        technical_summary: technical,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setEditingId(null);
      toast.success("Exame atualizado.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const editing = editingId === r.id;
        return (
          <Card key={r.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{r.exam_type ?? "Exame"}</p>
                  <p className="text-xs text-muted-foreground">Solicitado em {formatDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                  {canManage && !editing && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(r)} disabled={pending}>
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  )}
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor={`st-${r.id}`}>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id={`st-${r.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fam-${r.id}`}>Resumo para a família</Label>
                    <Textarea
                      id={`fam-${r.id}`}
                      rows={4}
                      value={family}
                      onChange={(e) => setFamily(e.target.value)}
                      placeholder="Resumo em linguagem acessível para a família..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tec-${r.id}`}>Resumo técnico</Label>
                    <Textarea
                      id={`tec-${r.id}`}
                      rows={4}
                      value={technical}
                      onChange={(e) => setTechnical(e.target.value)}
                      placeholder="Resumo técnico para o profissional..."
                    />
                  </div>
                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="gradient" onClick={() => onSave(r.id)} disabled={pending}>
                      {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} disabled={pending}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Resumo para a família</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {r.family_summary || <span className="text-muted-foreground">Não preenchido.</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Resumo técnico</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {r.technical_summary || <span className="text-muted-foreground">Não preenchido.</span>}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
