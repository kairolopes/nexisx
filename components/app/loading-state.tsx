import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Cabeçalho de página em carregamento (título + descrição). */
export function HeaderSkeleton() {
  return (
    <div className="mb-8 space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

/** Grade de cartões de estatística. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Lista de cartões (crianças, solicitações, etc.). */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Linhas de tabela/lista. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
            <Skeleton className="h-4 w-48 max-w-[40%]" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Composição genérica: cabeçalho + corpo. Usada nos loading.tsx de rota. */
export function LoadingState({
  variant = "list",
}: {
  variant?: "stats" | "cards" | "list";
}) {
  return (
    <div>
      <HeaderSkeleton />
      {variant === "stats" && (
        <div className="space-y-4">
          <StatGridSkeleton />
          <StatGridSkeleton />
        </div>
      )}
      {variant === "cards" && <CardGridSkeleton />}
      {variant === "list" && <ListSkeleton />}
    </div>
  );
}
