"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/sobre", label: "Sobre" },
  { href: "/salas-sensoriais", label: "Salas Sensoriais" },
  { href: "/dna", label: "DNA / Exoma" },
  { href: "/familias", label: "Para Famílias" },
  { href: "/profissionais", label: "Para Profissionais" },
  { href: "/escolas-clinicas", label: "Escolas e Clínicas" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass" : "bg-transparent"
          )}
        >
          <Link href="/" aria-label="NexisX — início">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/login")}>
              Login
            </Button>
            <Button variant="gradient" size="sm" onClick={() => (window.location.href = "/login")}>
              Acessar plataforma
            </Button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 lg:hidden"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/login" className="mt-1">
                <Button variant="gradient" className="w-full">
                  Acessar plataforma
                </Button>
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
