"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { createChild } from "@/lib/actions/children";

interface Option {
  id: string;
  label: string;
}

export function CreateChildDialog({
  guardianOptions,
  schoolOptions,
}: {
  guardianOptions: Option[];
  schoolOptions: Option[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFullName("");
    setBirthDate("");
    setGuardianId("");
    setSchoolId("");
    setNotes("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createChild({
        full_name: fullName,
        birth_date: birthDate || undefined,
        guardian_id: guardianId || undefined,
        school_id: schoolId || undefined,
        notes,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Criança cadastrada.");
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Cadastrar criança
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova criança</DialogTitle>
            <DialogDescription>
              Cadastre os dados básicos. Responsável e escola podem ser vinculados depois.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ch-name">Nome completo *</Label>
              <Input
                id="ch-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Helena Martins"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-birth">Data de nascimento</Label>
              <Input
                id="ch-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            {guardianOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="ch-guardian">Responsável (opcional)</Label>
                <Select value={guardianId} onValueChange={setGuardianId}>
                  <SelectTrigger id="ch-guardian">
                    <SelectValue placeholder="Sem vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {guardianOptions.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {schoolOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="ch-school">Escola (opcional)</Label>
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger id="ch-school">
                    <SelectValue placeholder="Sem vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="ch-notes">Observações</Label>
              <Textarea id="ch-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas gerais" />
            </div>
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={pending}>
                {pending ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
