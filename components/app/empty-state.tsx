import { Card, CardContent } from "@/components/ui/card";

/**
 * Estado vazio padronizado para telas conectadas ao banco. Mantém a aparência
 * consistente quando não há dados (sem parecer quebrado).
 */
export function EmptyState({
  title = "Nada por aqui ainda",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
