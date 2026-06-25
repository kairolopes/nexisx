import { PageHeader } from "@/components/app/page-header";
import { BarChart } from "@/components/app/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireSession } from "@/lib/guard";
import { listTasks, listDiaryEntries } from "@/lib/db/queries";

export default async function RelatoriosEvolutivosPage() {
  await requireSession();
  const [tasks, diary] = await Promise.all([listTasks(), listDiaryEntries()]);

  const concluidas = tasks.filter((t) => t.status === "concluida").length;
  const emAndamento = tasks.filter((t) => t.status === "em_andamento").length;
  const pendentes = tasks.filter((t) => t.status === "pendente").length;
  const criancas = new Set(tasks.map((t) => t.child_id).filter(Boolean)).size;

  const byStatus = [
    { label: "Pendente", value: pendentes },
    { label: "Em and.", value: emAndamento },
    { label: "Concluída", value: concluidas },
  ];

  const hasData = tasks.length > 0 || diary.length > 0;

  return (
    <>
      <PageHeader title="Relatórios evolutivos" description="Evolução consolidada a partir de tarefas e registros." />

      {!hasData ? (
        <EmptyState
          title="Sem dados para consolidar ainda"
          description="Conforme tarefas e registros do diário forem criados, a evolução aparece aqui."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Tarefas concluídas" value={concluidas} icon="ListTodo" />
            <StatCard label="Crianças acompanhadas" value={criancas} icon="LineChart" accent="secondary" />
            <StatCard label="Registros dos pais" value={diary.length} icon="BookHeart" accent="accent" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Tarefas por status</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={byStatus} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do período</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Total de tarefas" value={tasks.length} />
                <Row label="Concluídas" value={concluidas} />
                <Row label="Em andamento" value={emAndamento} />
                <Row label="Pendentes" value={pendentes} />
                <Row label="Registros no diário" value={diary.length} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
