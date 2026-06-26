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
import { createSchool } from "@/lib/actions/admin";

export function CreateSchoolDialog() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSchool(form);
      if (res.ok) {
        toast.success("Escola cadastrada.");
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
            <DialogTitle>Nova escola</DialogTitle>
            <DialogDescription>
              Cadastre uma instituição para vinculá-la a crianças acompanhadas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sc-name">Nome da escola *</Label>
              <Input id="sc-name" name="name" placeholder="Escola Estadual São Paulo" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc-city">Cidade</Label>
              <Input id="sc-city" name="city" placeholder="São Paulo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc-email">E-mail de contato</Label>
              <Input id="sc-email" name="contact_email" type="email" placeholder="secretaria@escola.edu.br" />
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
