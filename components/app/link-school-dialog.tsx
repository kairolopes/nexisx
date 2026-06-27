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
import { linkSchoolToChild } from "@/lib/actions/admin";
import type { SchoolRow, ChildRow } from "@/lib/db/types";

interface Props {
  schools: SchoolRow[];
  childList: ChildRow[];
}

export function LinkSchoolDialog({ schools, childList }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!childId || !schoolId) {
      toast.error("Selecione criança e escola.");
      return;
    }
    const form = new FormData();
    form.set("childId", childId);
    form.set("schoolId", schoolId);
    form.set("authorized", String(authorized));
    startTransition(async () => {
      const res = await linkSchoolToChild(form);
      if (res.ok) {
        toast.success("Escola vinculada.");
        setOpen(false);
        setChildId(""); setSchoolId(""); setAuthorized(true);
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
            <DialogTitle>Vincular escola a criança</DialogTitle>
            <DialogDescription>
              A escola passará a ter acesso autorizado aos dados da criança via RLS.
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
              <Label>Escola</Label>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{s.city ? ` — ${s.city}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
              />
              <span>Acesso autorizado pelo responsável</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={pending || !childId || !schoolId}>
                {pending ? "Vinculando..." : "Vincular"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
