"use client";

import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { linkProfessionalToChild } from "@/lib/actions/admin";
import type { ProfessionalRow } from "@/lib/db/types";
import type { ChildRow } from "@/lib/db/types";

interface Props {
  professionals: ProfessionalRow[];
  childList: ChildRow[];
}

export function LinkProfessionalDialog({ professionals, childList }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!childId || !professionalId) {
      toast.error("Selecione criança e profissional.");
      return;
    }
    const form = new FormData();
    form.set("childId", childId);
    form.set("professionalId", professionalId);
    startTransition(async () => {
      const res = await linkProfessionalToChild(form);
      if (res.ok) {
        toast.success("Profissional vinculado.");
        setOpen(false);
        setChildId(""); setProfessionalId("");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link2 className="h-4 w-4" /> Vincular a criança
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular profissional a criança</DialogTitle>
            <DialogDescription>
              O profissional passará a ter acesso aos dados da criança via RLS.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Criança</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger><SelectValue placeholder="Selecione a criança" /></SelectTrigger>
                <SelectContent>
                  {childList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select value={professionalId} onValueChange={setProfessionalId}>
                <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}{p.specialty ? ` — ${p.specialty}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={pending || !childId || !professionalId}>
                {pending ? "Vinculando..." : "Vincular"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
