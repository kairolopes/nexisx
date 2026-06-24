"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const moods = ["😄 Ótimo", "🙂 Bom", "😐 Neutro", "😟 Difícil", "😣 Crise"];

interface Entry {
  id: number;
  mood: string;
  note: string;
  date: string;
}

export function DiaryForm() {
  const [mood, setMood] = useState(moods[1]);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, mood: "🙂 Bom", note: "Dormiu bem e aceitou o café da manhã.", date: "23 jun" },
  ]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setEntries((prev) => [
      { id: Date.now(), mood, note, date: "Hoje" },
      ...prev,
    ]);
    setNote("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Novo registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="space-y-5">
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
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Como foi o dia?"
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full">
              Salvar registro
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {entries.map((entry) => (
          <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{entry.mood}</Badge>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{entry.note}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
