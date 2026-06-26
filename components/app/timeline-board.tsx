"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timeline, type TimelineEvent } from "@/components/app/timeline";
import { createTimelineEvent, deleteTimelineEvent } from "@/lib/actions/timeline";
import { useToast } from "@/components/ui/toast";

const KIND_LABELS: Record<string, string> = {
  consulta: "Consulta",
  diario: "Diário",
  triagem: "Triagem",
  facial: "Análise facial",
  relatorio: "Relatório",
  outro: "Outro",
};

interface ChildOption {
  id: string;
  full_name: string;
}

export function TimelineBoard({
  events,
  childOptions,
}: {
  events: TimelineEvent[];
  childOptions: ChildOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("outro");
  const [eventDate, setEventDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTimelineEvent({
        child_id: childId,
        title,
        description,
        kind,
        event_date: eventDate || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setTitle("");
      setDescription("");
      setEventDate("");
      setOpen(false);
      toast.success("Evento adicionado à linha do tempo.");
      router.refresh();
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteTimelineEvent({ id });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Evento excluído.");
      router.refresh();
    });
  }

  const noChildren = childOptions.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" disabled={noChildren}>
              <Plus className="h-4 w-4" /> Novo evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo evento na linha do tempo</DialogTitle>
              <DialogDescription>Registre um marco manual do acompanhamento.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              {childOptions.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="t-child">Criança</Label>
                  <Select value={childId} onValueChange={setChildId}>
                    <SelectTrigger id="t-child">
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
              <div className="space-y-2">
                <Label htmlFor="t-title">Título</Label>
                <Input id="t-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Consulta com neuropediatra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-kind">Tipo</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger id="t-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(KIND_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-date">Data</Label>
                <Input id="t-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-desc">Descrição (opcional)</Label>
                <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do evento" />
              </div>
              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" variant="gradient" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Timeline events={events} onDelete={onDelete} />
    </div>
  );
}
