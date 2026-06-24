import { PageHeader } from "@/components/app/page-header";
import { BarChart } from "@/components/app/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";

const tasksByWeek = [
  { label: "S1", value: 14 },
  { label: "S2", value: 18 },
  { label: "S3", value: 21 },
  { label: "S4", value: 26 },
];

export default function RelatoriosEvolutivosPage() {
  return (
    <>
      <PageHeader title="Relatórios evolutivos" description="Evolução por período e consolidação de atividades." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tarefas concluídas" value={79} icon="ListTodo" trend="+18% no mês" />
        <StatCard label="Frequência de atividades" value="92%" icon="LineChart" accent="secondary" />
        <StatCard label="Registros dos pais" value={24} icon="BookHeart" accent="accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas concluídas por semana</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={tasksByWeek} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Síntese do período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-emerald-600">Pontos de melhora</p>
              <p className="text-muted-foreground">Maior engajamento em atividades de comunicação.</p>
            </div>
            <div>
              <p className="font-medium text-amber-600">Pontos de atenção</p>
              <p className="text-muted-foreground">Sono ainda irregular em dias de mudança de rotina.</p>
            </div>
            <div>
              <p className="font-medium text-primary">Próximos passos</p>
              <p className="text-muted-foreground">Manter rotina visual e revisar com a equipe terapêutica.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
