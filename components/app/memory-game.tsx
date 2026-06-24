"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EMOJIS = ["🌟", "🐢", "🎈", "🍎", "🚀", "🎵"];

function buildDeck() {
  const pairs = [...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e }));
  // embaralhamento determinístico simples (sem Math.random no SSR)
  return pairs.sort((a, b) => ((a.id * 7) % 11) - ((b.id * 5) % 11));
}

export function MemoryGame() {
  const [deck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  function flip(idx: number) {
    if (flipped.includes(idx) || matched.includes(idx) || flipped.length === 2) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].emoji === deck[b].emoji) {
        setMatched((prev) => [...prev, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }

  function reset() {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  const won = matched.length === deck.length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Movimentos: {moves}</span>
          {won && <span className="text-sm font-medium text-emerald-600">🎉 Concluído!</span>}
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
      </CardContent>
    </Card>
  );
}
