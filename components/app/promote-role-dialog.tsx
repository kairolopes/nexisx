"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { promoteRole } from "@/lib/actions/admin";
import { ROLE_LABELS, type Role } from "@/lib/types";
import type { ProfileRow } from "@/lib/db/types";

interface Props {
  profiles: ProfileRow[];
}

const ROLES: Role[] = ["responsavel", "profissional", "escola", "consultor", "admin"];

export function PromoteRoleDialog({ profiles }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [role, setRole] = useState<Role>("responsavel");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profileId) { toast.error("Selecione um usuário."); return; }
    const form = new FormData();
    form.set("profileId", profileId);
    form.set("role", role);
    startTransition(async () => {
      const res = await promoteRole(form);
      if (res.ok) {
        toast.success("Papel atualizado.");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <ShieldCheck className="h-4 w-4" /> Alterar papel
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar papel de usuário</DialogTitle>
            <DialogDescription>
              Selecione o usuário e o novo papel. O papel define o escopo de acesso via RLS.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={profileId} onValueChange={setProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name ?? p.id} — {ROLE_LABELS[p.role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Novo papel</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={pending || !profileId}>
                {pending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
