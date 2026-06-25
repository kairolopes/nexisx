"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createGeneticExamRequest } from "@/lib/actions/genetic";
import { useToast } from "@/components/ui/toast";

interface ChildOption {
  id: string;
  full_name: string;
}

export function GeneticRequestForm({ childOptions }: { childOptions: ChildOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examType, setExamType] = useState("");
  const [childId, setChildId] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createGeneticExamRequest({
        exam_type: examType,
        child_id: childId || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setExamType("");
      setChildId("");
      setOpen(false);
      toast.success("Solicitação de exame registrada.");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <Plus className="h-4 w-4" /> Solicitar exame
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar exame genético</DialogTitle>
          <DialogDescription>
            Registre uma solicitação. A interpretação cabe a profissionais habilitados.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="g-type">Tipo de exame</Label>
            <Input
              id="g-type"
              required
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="Exoma, CGH Array..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-child">Criança (opcional)</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger id="g-child">
                <SelectValue placeholder="Sem vínculo" />
              </SelectTrigger>
              <SelectContent>
                {childOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="gradient" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Enviar solicitação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
