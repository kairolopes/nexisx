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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="rounded-full bg-black/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
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
