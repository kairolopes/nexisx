"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NavIcon } from "./icon";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const content = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 no-scrollbar">
      <Link href="/" className="px-1">
        <Logo />
      </Link>
      <nav className="flex flex-col gap-5">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            {list.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-gradient-to-r from-primary/15 to-accent/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/50 lg:block">
        {content}
      </aside>

      {/* mobile toggle */}
      <button
        className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 h-full w-72 bg-card shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg border border-border"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
