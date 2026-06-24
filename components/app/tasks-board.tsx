"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/types";

interface Task {
  id: number;
  title: string;
  category: string;
  points: number;
  status: TaskStatus;
}

const initial: Task[] = [
  { id: 1, title: "Rotina da manhã com pictogramas", category: "Casa", points: 10, status: "pendente" },
  { id: 2, title: "Atividade de associação (cores)", category: "Terapia", points: 15, status: "em_andamento" },
  { id: 3, title: "Leitura compartilhada", category: "Escola", points: 10, status: "pendente" },
  { id: 4, title: "Exercício de respiração", category: "Regulação", points: 5, status: "concluida" },
  { id: 5, title: "Jogo de memória", category: "Cognição", points: 20, status: "em_andamento" },
];

const columns: { key: TaskStatus; label: string }[] = [
  { key: "pendente", label: "Pendente" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "concluida", label: "Concluída" },
];

const order: TaskStatus[] = ["pendente", "em_andamento", "concluida"];

export function TasksBoard() {
  const [tasks, setTasks] = useState(initial);

  function advance(id: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = order.indexOf(t.status);
        return { ...t, status: order[Math.min(idx + 1, order.length - 1)] };
      })
    );
  }

  const points = tasks.filter((t) => t.status === "concluida").reduce((s, t) => s + t.points, 0);

  return (
    <>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-4">
        <Trophy className="h-6 w-6 text-amber-500" />
        <span className="font-medium">Pontuação acumulada: {points} pts</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold">{col.label}</h3>
              <Badge variant="outline">{tasks.filter((t) => t.status === col.key).length}</Badge>
            </div>
            {tasks
              .filter((t) => t.status === col.key)
              .map((t) => (
                <motion.div key={t.id} layout>
                  <Card
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => advance(t.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{t.title}</p>
                        <span className="shrink-0 text-xs text-primary">+{t.points}</span>
                      </div>
                      <Badge variant="secondary" className="mt-3">{t.category}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            {col.key === "pendente" && (
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary/40">
                <Plus className="h-4 w-4" /> Nova tarefa
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
