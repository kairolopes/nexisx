"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trophy, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask, completeTask } from "@/lib/actions/tasks";
import { useToast } from "@/components/ui/toast";
import type { TaskRow } from "@/lib/db/types";
import type { TaskStatus } from "@/lib/types";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "pendente", label: "Pendente" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "concluida", label: "Concluída" },
];

interface ChildOption {
  id: string;
  full_name: string;
}

export function TasksBoard({
  tasks,
  childOptions,
  canManage,
}: {
  tasks: TaskRow[];
  childOptions: ChildOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [points, setPoints] = useState(10);
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");

  const totalPoints = tasks
    .filter((t) => t.status === "concluida")
    .reduce((s, t) => s + (t.points ?? 0), 0);

  function onComplete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await completeTask(id);
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Tarefa concluída! 🎉");
        router.refresh();
      }
    });
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTask({ child_id: childId, title, category, points });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setTitle("");
      setCategory("");
      setPoints(10);
      setShowForm(false);
      toast.success("Tarefa criada.");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-4">
        <span className="flex items-center gap-3 font-medium">
          <Trophy className="h-6 w-6 text-amber-500" /> Pontuação acumulada: {totalPoints} pts
        </span>
        {canManage && childOptions.length > 0 && (
          <Button variant="gradient" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {showForm && canManage && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="t-title">Título</Label>
                <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex.: Rotina da manhã" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-cat">Categoria</Label>
                <Input id="t-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Casa, Terapia..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-points">Pontos</Label>
                <Input id="t-points" type="number" min={0} max={1000} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="t-child">Criança</Label>
                <Select value={childId} onValueChange={setChildId}>
                  <SelectTrigger id="t-child">
                    <SelectValue placeholder="Selecione a criança" />
                  </SelectTrigger>
                  <SelectContent>
                    {childOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="gradient" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Criar tarefa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
            Nenhuma tarefa cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col) => {
            const list = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold">{col.label}</h3>
                  <Badge variant="outline">{list.length}</Badge>
                </div>
                {list.map((t) => {
                  const done = t.status === "concluida";
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Card className="transition-colors hover:border-primary/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm font-medium", done && "text-muted-foreground line-through")}>
                              {t.title}
                            </p>
                            <span className="shrink-0 text-xs text-primary">+{t.points}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            {t.category && <Badge variant="secondary">{t.category}</Badge>}
                            {done && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Concluída
                              </motion.span>
                            )}
                          </div>
                          {!done && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full"
                              disabled={pending}
                              onClick={() => onComplete(t.id)}
                            >
                              Concluir
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
