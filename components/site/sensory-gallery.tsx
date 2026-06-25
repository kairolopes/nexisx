"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { title: "Tubos de bolhas", gradient: "from-sky-400 to-indigo-500" },
  { title: "Fibra óptica", gradient: "from-fuchsia-400 to-purple-600" },
  { title: "Iluminação LED", gradient: "from-emerald-400 to-teal-500" },
  { title: "Painéis interativos", gradient: "from-amber-400 to-orange-500" },
  { title: "Projeções imersivas", gradient: "from-cyan-400 to-blue-600" },
  { title: "Espaço de relaxamento", gradient: "from-rose-400 to-pink-600" },
];

export function SensoryGallery() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${items[active].gradient}`}
          >
            {/* brilho ambiente */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_55%)]" />
            <div className="absolute inset-0 animate-pulse-glow bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.25),transparent_45%)]" />

            {/* "fibras ópticas" — linhas luminosas sutis */}
            <div className="absolute inset-0 overflow-hidden opacity-60">
              {[18, 38, 58, 78].map((left, i) => (
                <span
                  key={left}
                  className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-white/70 to-transparent animate-pulse-glow"
                  style={{ left: `${left}%`, animationDelay: `${i * 0.6}s` }}
                />
              ))}
            </div>

            {/* pontos de luz (LED) flutuantes */}
            <div className="absolute inset-0">
              {[
                { l: "20%", t: "30%", d: "0s" },
                { l: "70%", t: "25%", d: "0.8s" },
                { l: "45%", t: "60%", d: "1.4s" },
                { l: "80%", t: "65%", d: "2s" },
              ].map((p) => (
                <span
                  key={p.l + p.t}
                  className="absolute h-2.5 w-2.5 rounded-full bg-white/80 blur-[1px] animate-float"
                  style={{ left: p.l, top: p.t, animationDelay: p.d }}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 p-8">
              <span className="rounded-full bg-black/25 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                {items[active].title}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => (
          <button
            key={it.title}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
              active === i ? "border-primary shadow-lg" : "border-border hover:border-primary/40"
            }`}
          >
            <div className={`mb-3 h-16 w-full rounded-xl bg-gradient-to-br ${it.gradient} transition-transform group-hover:scale-105`} />
            <span className="text-sm font-medium">{it.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
