"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createProfessional } from "@/lib/actions/admin";

export function CreateProfessionalDialog() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProfessional(form);
      if (res.ok) {
        toast.success("Profissional cadastrado.");
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Adicionar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo profissional</DialogTitle>
            <DialogDescription>
              Cadastre um profissional para vinculá-lo a crianças na plataforma.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pr-name">Nome completo *</Label>
              <Input id="pr-name" name="full_name" placeholder="Dr. Ana Souza" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-specialty">Especialidade</Label>
              <Input id="pr-specialty" name="specialty" placeholder="Neuropediatria" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-reg">Registro (CRM / CRP / CREFONO)</Label>
              <Input id="pr-reg" name="registration" placeholder="CRM-SP 123456" />
            </div>
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
