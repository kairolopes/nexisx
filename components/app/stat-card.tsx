import { Card, CardContent } from "@/components/ui/card";
import { NavIcon } from "./icon";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";

const accentMap = {
  primary: "from-primary/15 to-primary/5 text-primary",
  secondary: "from-secondary/15 to-secondary/5 text-secondary",
  accent: "from-accent/15 to-accent/5 text-accent",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = "primary",
  suffix,
}: {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  accent?: "primary" | "secondary" | "accent";
  suffix?: string;
}) {
  return (
    <Card className="group hover:-translate-y-0.5 hover:shadow-elevation-2">
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
            accentMap[accent],
          )}
        >
          <NavIcon name={icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold tabular-nums">
            {typeof value === "number" ? <AnimatedCounter value={value} suffix={suffix} /> : value}
          </p>
          {trend && <p className="text-xs text-emerald-600">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/** Cartão de métrica em destaque (hero) — usado no topo do dashboard. */
export function FeaturedStat({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number;
  icon: string;
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-elevation-3">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-20 shimmer" />
      <CardContent className="relative p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <NavIcon name={icon} className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-white/90">{label}</span>
        </div>
        <p className="mt-5 font-display text-5xl font-bold tabular-nums">
          <AnimatedCounter value={value} />
        </p>
        {hint && <p className="mt-1 text-sm text-white/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}
