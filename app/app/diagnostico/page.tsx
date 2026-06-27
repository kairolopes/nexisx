import { requireRole } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";

interface CheckResult {
  label: string;
  ok: boolean;
  detail?: string;
}

async function runDiagnostics(email: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  results.push({ label: "Usuário autenticado", ok: true, detail: email });
  results.push({ label: "Role admin confirmado", ok: true });

  const supabase = createClient();

  const coreTables: [string, string][] = [
    ["children", "children"],
    ["mchat_sessions", "mchat_sessions"],
    ["screening_reports", "screening_reports"],
  ];

  for (const [label, table] of coreTables) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    results.push({
      label: `Tabela \`${label}\` acessível`,
      ok: !error,
      detail: error ? error.message : undefined,
    });
  }

  const { error: sdError } = await supabase
    .from("digital_screening_sessions")
    .select("id", { count: "exact", head: true });
  results.push({
    label: "screening_digital.sql aplicado",
    ok: !sdError,
    detail: sdError
      ? "Tabela não encontrada — aplicar supabase/screening_digital.sql"
      : undefined,
  });

  return results;
}

export default async function DiagnosticoPage() {
  const session = await requireRole(["admin"]);
  const results = await runDiagnostics(session.email);

  const allOk = results.every((r) => r.ok);

  return (
    <>
      <PageHeader
        title="Diagnóstico"
        description="Estado da conexão e configuração — visível apenas para admin."
      />

      <div className="space-y-3 max-w-lg">
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            allOk
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          {allOk ? "✓ Todos os checks passaram" : "⚠ Um ou mais checks falharam"}
        </div>

        <div className="surface-card rounded-xl divide-y divide-border">
          {results.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                {r.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                )}
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  r.ok ? "text-green-600 dark:text-green-400" : "text-destructive"
                }`}
              >
                {r.ok ? "OK" : "FALHOU"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground px-1">
          Esta página é visível apenas para admins. Não expõe chaves nem dados sensíveis.
          Queries usam o client RLS do usuário logado.
        </p>
      </div>
    </>
  );
}
