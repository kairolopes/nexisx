"use client";

import { ErrorState } from "@/components/app/error-state";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container pt-32">
      <ErrorState
        reset={reset}
        backHref="/"
        backLabel="Voltar ao início"
        description="Tivemos um problema ao carregar esta página. Você pode tentar novamente."
      />
    </div>
  );
}
