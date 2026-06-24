"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGeneticExamRequest } from "@/lib/actions/genetic";

interface ChildOption {
  id: string;
  full_name: string;
}

export function GeneticRequestForm({ childOptions }: { childOptions: ChildOption[] }) {
  const router = useRouter();
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
        return;
      }
      setExamType("");
      setChildId("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Solicitar exame
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="g-type">Tipo de exame</Label>
            <Input id="g-type" required value={examType} onChange={(e) => setExamType(e.target.value)} placeholder="Exoma, CGH Array..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-child">Criança (opcional)</Label>
            <select
              id="g-child"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm"
            >
              <option value="">—</option>
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          {error && <p className="sm:col-span-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="gradient" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Enviar solicitação
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
