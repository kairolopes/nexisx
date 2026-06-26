"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from "@/lib/actions/diary";
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

  // criar
  const [mood, setMood] = useState(moods[1]);
  const [note, setNote] = useState("");
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");

  // editar
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMood, setEditMood] = useState(moods[1]);
  const [editNote, setEditNote] = useState("");

  // excluir — confirmação inline
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createDiaryEntry({ child_id: childId, mood, notes: note });
      if (!res.ok) { setError(res.error); toast.error(res.error); return; }
      setNote("");
      toast.success("Registro salvo no diário.");
      router.refresh();
    });
  }

  function onEdit(entry: ParentDiaryEntryRow) {
    setConfirmDeleteId(null);
    setEditingId(entry.id);
    setEditMood(entry.mood ?? moods[1]);
    setEditNote(entry.notes ?? "");
  }

  function onSave(id: string) {
    startTransition(async () => {
      const res = await updateDiaryEntry({ id, mood: editMood, notes: editNote });
      if (!res.ok) { toast.error(res.error); return; }
      setEditingId(null);
      toast.success("Registro atualizado.");
      router.refresh();
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteDiaryEntry({ id });
      if (!res.ok) { toast.error(res.error); return; }
      setConfirmDeleteId(null);
      toast.success("Registro excluído.");
      router.refresh();
    });
  }

  const noChildren = childOptions.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Formulário de criação */}
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

      {/* Lista de entradas */}
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
                  {editingId === entry.id ? (
                    /* Modo edição */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Humor do dia</Label>
                        <div className="flex flex-wrap gap-2">
                          {moods.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setEditMood(m)}
                              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                editMood === m ? "border-primary bg-primary/10 text-primary" : "border-border"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea
                          rows={4}
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Como foi o dia?"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="gradient" size="sm" onClick={() => onSave(entry.id)} disabled={pending}>
                          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={pending}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : confirmDeleteId === entry.id ? (
                    /* Confirmação de exclusão */
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Excluir este registro? Esta ação não pode ser desfeita.</p>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => onDelete(entry.id)} disabled={pending}>
                          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Excluir
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)} disabled={pending}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Modo visualização */
                    <>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{entry.mood ?? "registro"}</Badge>
                        <div className="flex items-center gap-1">
                          <span className="mr-1 text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            aria-label="Editar registro"
                            onClick={() => onEdit(entry)}
                            disabled={pending}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            aria-label="Excluir registro"
                            onClick={() => { setEditingId(null); setConfirmDeleteId(entry.id); }}
                            disabled={pending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {entry.notes && <p className="mt-3 text-sm text-muted-foreground">{entry.notes}</p>}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
