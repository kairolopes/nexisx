import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionProfile } from "@/lib/auth";
import { countRows, listTimelineEvents, listScreeningReports } from "@/lib/db/queries";

export default async function DashboardPage() {
  const session = await getSessionProfile();
  const name = session?.profile.full_name ?? "bem-vindo";

  // Contadores reais (respeitam RLS; 0 quando vazio ou sem backend)
  const [
    totalChildren,
    triagens,
    tarefasConcluidas,
    solicitacoesSala,
    examesGeneticos,
    documentos,
    relatorios,
    timeline,
  ] = await Promise.all([
    countRows("children"),
    countRows("mchat_sessions"),
    countRows("task_completions"),
    countRows("sensory_room_requests"),
    countRows("genetic_exam_requests"),
    countRows("uploaded_documents"),
    listScreeningReports(),
    listTimelineEvents(),
  ]);

  // Crianças em acompanhamento = distintas com eventos na linha do tempo
  const emAcompanhamento = new Set(timeline.map((e) => e.child_id).filter(Boolean)).size;
  const relatoriosPendentes = relatorios.filter((r) => !r.priority).length;

  return (
    <>
      <PageHeader title={`Olá, ${name} 👋`} description="Visão geral da operação no NexisX." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Crianças cadastradas" value={totalChildren} icon="Users" accent="primary" />
        <StatCard label="Triagens realizadas" value={triagens} icon="ClipboardCheck" accent="accent" />
        <StatCard label="Em acompanhamento" value={emAcompanhamento} icon="LineChart" accent="secondary" />
        <StatCard label="Tarefas concluídas" value={tarefasConcluidas} icon="ListTodo" accent="primary" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solicitações de sala" value={solicitacoesSala} icon="Sparkles" accent="accent" />
        <StatCard label="Exames genéticos" value={examesGeneticos} icon="Dna" accent="secondary" />
        <StatCard label="Laudos / documentos" value={documentos} icon="FileSearch" accent="primary" />
        <StatCard label="Relatórios pendentes" value={relatoriosPendentes} icon="FileText" accent="accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.length === 0 ? (
              <EmptyHint text="Sem eventos registrados ainda. Conforme a operação avança, a atividade aparece aqui." />
            ) : (
              timeline.slice(0, 6).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <span className="truncate text-sm">{e.title}</span>
                  <Badge variant="outline">{e.kind ?? "evento"}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SummaryRow label="Crianças" value={totalChildren} />
            <SummaryRow label="Triagens (M-CHAT)" value={triagens} />
            <SummaryRow label="Relatórios de triagem" value={relatorios.length} />
            <SummaryRow label="Solicitações de sala" value={solicitacoesSala} />
            <SummaryRow label="Exames genéticos" value={examesGeneticos} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
