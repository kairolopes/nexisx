"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Tela de erro premium e segura — não expõe stack trace ao usuário.
 * Usada pelos error.tsx de cada segmento (Error Boundaries do Next).
 */
export function ErrorState({
  title = "Algo não saiu como esperado",
  description = "Tivemos um problema ao carregar esta página. Você pode tentar novamente.",
  reset,
  backHref = "/app",
  backLabel = "Voltar ao painel",
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="heading-md">{title}</h1>
      <p className="text-pretty text-sm text-muted-foreground">{description}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        {reset && (
          <Button variant="gradient" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Tentar novamente
          </Button>
        )}
        <Link href={backHref}>
          <Button variant="outline">{backLabel}</Button>
        </Link>
      </div>
    </div>
  );
}
