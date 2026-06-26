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
import { createGuardian } from "@/lib/actions/admin";

export function CreateGuardianDialog() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createGuardian(form);
      if (res.ok) {
        toast.success("Responsável cadastrado.");
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
            <DialogTitle>Novo responsável</DialogTitle>
            <DialogDescription>
              Cadastre um responsável para vinculá-lo a uma criança.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gu-name">Nome completo *</Label>
              <Input id="gu-name" name="full_name" placeholder="Maria Silva" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gu-rel">Vínculo com a criança</Label>
              <Input id="gu-rel" name="relationship" placeholder="Mãe, Pai, Avó..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gu-phone">Telefone</Label>
              <Input id="gu-phone" name="phone" type="tel" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gu-email">E-mail</Label>
              <Input id="gu-email" name="email" type="email" placeholder="responsavel@email.com" />
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
