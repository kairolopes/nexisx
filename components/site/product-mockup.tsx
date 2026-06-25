import { cn } from "@/lib/utils";

/**
 * Mockups do produto construídos 100% em código (sem imagens externas).
 * Usados no hero e nas seções do site público.
 */

const bars = [38, 56, 44, 72, 60, 88];

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl", className)}>
      {/* chrome da janela */}
      <div className="flex items-center gap-2 border-b border-white/30 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 h-5 w-40 rounded-md bg-foreground/5" />
      </div>

      <div className="grid grid-cols-[64px_1fr] gap-0">
        {/* sidebar */}
        <div className="space-y-2 border-r border-white/20 p-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("h-2.5 rounded bg-foreground/10", i === 1 ? "w-7 bg-primary/40" : "w-6")} />
          ))}
        </div>

        {/* conteúdo */}
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {["from-primary/20", "from-accent/20", "from-secondary/20"].map((g, i) => (
              <div key={i} className={cn("rounded-xl bg-gradient-to-br to-transparent p-2.5", g)}>
                <div className="h-1.5 w-8 rounded bg-foreground/15" />
                <div className="mt-2 h-4 w-10 rounded bg-foreground/25" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/30 bg-white/40 p-3">
            <div className="mb-2 h-1.5 w-16 rounded bg-foreground/15" />
            <div className="flex h-20 items-end gap-1.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-primary to-accent"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/30 px-2.5 py-2">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary/40 to-accent/40" />
                <div className="h-2 flex-1 rounded bg-foreground/10" />
                <div className="h-4 w-10 rounded-full bg-emerald-400/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cartão flutuante pequeno (chips do hero). */
export function FloatingChip({
  icon,
  title,
  subtitle,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn("glass-card flex items-center gap-3 rounded-2xl px-4 py-3", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
