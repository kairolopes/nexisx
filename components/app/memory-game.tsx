"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { saveGameSession } from "@/lib/actions/games";

const EMOJIS = ["🌟", "🐢", "🎈", "🍎", "🚀", "🎵"];

function buildDeck() {
  const pairs = [...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e }));
  return pairs.sort((a, b) => ((a.id * 7) % 11) - ((b.id * 5) % 11));
}

interface ChildOption {
  id: string;
  full_name: string;
}

interface Props {
  childOptions?: ChildOption[];
}

export function MemoryGame({ childOptions = [] }: Props) {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flip(idx: number) {
    if (flipped.includes(idx) || matched.includes(idx) || flipped.length === 2) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].emoji === deck[b].emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        // Jogo completo — persistir se houver criança selecionada
        if (newMatched.length === deck.length && childId && !saved) {
          startTransition(async () => {
            const res = await saveGameSession({ child_id: childId, score: moves + 1, phase: 1 });
            if (res.ok) {
              setSaved(true);
            } else {
              setSaveError(res.error);
            }
          });
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }

  function reset() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSaved(false);
    setSaveError(null);
  }

  const won = matched.length === deck.length;

  return (
    <Card>
      <CardContent className="p-6">
        {childOptions.length > 1 && (
          <div className="mb-4 space-y-1.5">
            <Label htmlFor="mg-child">Criança</Label>
            <Select value={childId} onValueChange={(v) => { setChildId(v); setSaved(false); }}>
              <SelectTrigger id="mg-child">
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

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Movimentos: {moves}</span>
          {won && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              🎉 Concluído!
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saved && <span className="text-xs text-muted-foreground">(salvo)</span>}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={reset}>
            Reiniciar
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {deck.map((card, idx) => {
            const show = flipped.includes(idx) || matched.includes(idx);
            return (
              <motion.button
                key={idx}
                onClick={() => flip(idx)}
                whileTap={{ scale: 0.94 }}
                disabled={won}
                className={`aspect-square rounded-2xl text-2xl transition-colors ${
                  show
                    ? "bg-gradient-to-br from-primary/15 to-accent/15"
                    : "bg-muted hover:bg-muted/70"
                }`}
              >
                {show ? card.emoji : ""}
              </motion.button>
            );
          })}
        </div>

        {saveError && (
          <p className="mt-3 text-xs text-destructive">{saveError}</p>
        )}
        {!childId && childOptions.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Selecione uma criança para salvar o resultado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
