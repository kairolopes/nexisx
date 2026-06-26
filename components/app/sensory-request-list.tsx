"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSensoryRoomRequest, SENSORY_REQUEST_STATUSES } from "@/lib/actions/sensory";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { SensoryRoomRequestRow } from "@/lib/db/types";

const STATUS_OPTIONS: { value: (typeof SENSORY_REQUEST_STATUSES)[number]; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "aprovado", label: "Aprovado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

function statusVariant(s: string): "warning" | "secondary" | "success" | "danger" | "default" {
  if (s === "aprovado" || s === "concluido") return "success";
  if (s === "cancelado") return "danger";
  if (s === "em_contato") return "secondary";
  return "warning";
}

function statusLabel(s: string): string {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

export function SensoryRequestList({
  requests,
  canManage,
}: {
  requests: SensoryRoomRequestRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("novo");

  function onEdit(r: SensoryRoomRequestRow) {
    setEditingId(r.id);
    setStatus(r.status ?? "novo");
  }

  function onSave(id: string) {
    startTransition(async () => {
      const res = await updateSensoryRoomRequest({ id, status });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setEditingId(null);
      toast.success("Status atualizado.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const editing = editingId === r.id;
        return (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.requester_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.email ?? r.phone ?? "—"} · {r.environment ?? "Ambiente não especificado"}
                  </p>
                  {r.message && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Recebido em {formatDate(r.created_at)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-40">
                        <Label htmlFor={`st-${r.id}`} className="sr-only">Status</Label>
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
                      <Button variant="gradient" size="sm" onClick={() => onSave(r.id)} disabled={pending}>
                        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={pending}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                      {canManage && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(r)} disabled={pending}>
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
