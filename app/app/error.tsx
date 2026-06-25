"use client";

import { ErrorState } from "@/components/app/error-state";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} backHref="/app" backLabel="Voltar ao painel" />;
}
