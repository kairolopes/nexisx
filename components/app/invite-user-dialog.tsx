"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { inviteUser } from "@/lib/actions/admin";

export function InviteUserDialog() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await inviteUser(form);
      if (res.ok) {
        toast.success("Convite enviado com sucesso.");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Convidar usuário
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar usuário</DialogTitle>
            <DialogDescription>
              O usuário receberá um e-mail com link para criar a conta. Ele entrará com o papel
              de Responsável e pode ser promovido depois.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inv-email">E-mail</Label>
              <Input
                id="inv-email"
                name="email"
                type="email"
                placeholder="usuario@email.com"
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={pending}>
                {pending ? "Enviando..." : "Enviar convite"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
