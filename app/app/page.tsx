import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { BarChart } from "@/components/app/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionProfile } from "@/lib/auth";

const screenings = [
  { label: "Jan", value: 12 },
  { label: "Fev", value: 18 },
  { label: "Mar", value: 22 },
  { label: "Abr", value: 19 },
  { label: "Mai", value: 28 },
  { label: "Jun", value: 34 },
];

const recent = [
  { name: "Triagem · Helena M.", status: "Concluída", variant: "success" as const },
  { name: "Sala sensorial · Escola Aurora", status: "Em análise", variant: "warning" as const },
  { name: "Exoma · Pedro A.", status: "Aguardando laudo", variant: "default" as const },
  { name: "M-CHAT · Lívia R.", status: "Risco moderado", variant: "warning" as const },
  { name: "Acompanhamento · Theo S.", status: "Atualizado", variant: "success" as const },
];

export default async function DashboardPage() {
  const session = await getSessionProfile();
  const name = session?.profile.full_name ?? "bem-vindo";

  return (
    <>
      <PageHeader
        title={`Olá, ${name} 👋`}
        description="Visão geral da operação no NexisX."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Crianças cadastradas" value={128} icon="Users" trend="+12 este mês" accent="primary" />
        <StatCard label="Triagens realizadas" value={342} icon="ClipboardCheck" trend="+34 este mês" accent="accent" />
        <StatCard label="Em acompanhamento" value={87} icon="LineChart" accent="secondary" />
        <StatCard label="Tarefas concluídas" value={1294} icon="ListTodo" trend="+8%" accent="primary" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solicitações de sala" value={19} icon="Sparkles" accent="accent" />
        <StatCard label="Exames solicitados" value={23} icon="Dna" accent="secondary" />
        <StatCard label="Relatórios pendentes" value={6} icon="FileText" accent="primary" />
        <StatCard label="Leads recebidos" value={41} icon="Inbox" trend="+5 hoje" accent="accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Triagens por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={screenings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((r) => (
              <div key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <span className="truncate text-sm">{r.name}</span>
                <Badge variant={r.variant}>{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
