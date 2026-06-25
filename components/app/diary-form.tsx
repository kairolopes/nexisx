"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDiaryEntry } from "@/lib/actions/diary";
import { useToast } from "@/components/ui/toast";
import type { ParentDiaryEntryRow } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

const moods = ["😄 Ótimo", "🙂 Bom", "😐 Neutro", "😟 Difícil", "😣 Crise"];

interface ChildOption {
  id: string;
  full_name: string;
}

export function DiaryForm({
  entries,
  childOptions,
}: {
  entries: ParentDiaryEntryRow[];
  childOptions: ChildOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState(moods[1]);
  const [note, setNote] = useState("");
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createDiaryEntry({ child_id: childId, mood, notes: note });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setNote("");
      toast.success("Registro salvo no diário.");
      router.refresh();
    });
  }

  const noChildren = childOptions.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Novo registro</CardTitle>
        </CardHeader>
        <CardContent>
          {noChildren ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma criança vinculada à sua conta para registrar o diário.
            </p>
          ) : (
            <form onSubmit={add} className="space-y-5">
              {childOptions.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="d-child">Criança</Label>
                  <Select value={childId} onValueChange={setChildId}>
                    <SelectTrigger id="d-child">
                      <SelectValue placeholder="Selecione a criança" />
                    </SelectTrigger>
                    <SelectContent>
                      {childOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Humor do dia</Label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        mood === m ? "border-primary bg-primary/10 text-primary" : "border-border"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Observações (sono, alimentação, crises, conquistas)</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como foi o dia?" />
              </div>
              {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar registro
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
              Nenhum registro no diário ainda.
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{entry.mood ?? "registro"}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
                  </div>
                  {entry.notes && <p className="mt-3 text-sm text-muted-foreground">{entry.notes}</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
