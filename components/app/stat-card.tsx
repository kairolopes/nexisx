import { Card, CardContent } from "@/components/ui/card";
import { NavIcon } from "./icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  accent?: "primary" | "secondary" | "accent";
}) {
  const accentMap = {
    primary: "from-primary/15 to-primary/5 text-primary",
    secondary: "from-secondary/15 to-secondary/5 text-secondary",
    accent: "from-accent/15 to-accent/5 text-accent",
  };
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn("grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br", accentMap[accent])}>
          <NavIcon name={icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
          {trend && <p className="text-xs text-emerald-600">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
