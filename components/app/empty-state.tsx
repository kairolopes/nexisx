import { Inbox, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Estado vazio padronizado para telas conectadas ao banco. Mantém a aparência
 * consistente e premium quando não há dados (sem parecer quebrado).
 */
export function EmptyState({
  title = "Nada por aqui ainda",
  description,
  icon: Icon = Inbox,
  action,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="max-w-sm text-pretty text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
