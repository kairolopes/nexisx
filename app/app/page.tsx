import { PageHeader } from "@/components/app/page-header";
import { StatCard, FeaturedStat } from "@/components/app/stat-card";
import { MotionList, MotionItem } from "@/components/app/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavIcon } from "@/components/app/icon";
import { getSessionProfile } from "@/lib/auth";
import { countRows, listTimelineEvents, listScreeningReports } from "@/lib/db/queries";

const KIND_ICON: Record<string, string> = {
  triagem: "ClipboardCheck",
  facial: "ScanFace",
  relatorio: "FileText",
  consulta: "Stethoscope",
  diario: "BookHeart",
};

export default async function DashboardPage() {
  const session = await getSessionProfile();
  const name = session?.profile.full_name ?? "bem-vindo";

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

  const emAcompanhamento = new Set(timeline.map((e) => e.child_id).filter(Boolean)).size;
  const relatoriosPendentes = relatorios.filter((r) => !r.priority).length;

  return (
    <>
      <PageHeader title={`Olá, ${name} 👋`} description="Visão geral da operação no NexisX." />

      {/* Métrica principal + secundárias */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        <FeaturedStat
          label="Crianças cadastradas"
          value={totalChildren}
          icon="Users"
          hint={`${emAcompanhamento} em acompanhamento ativo`}
        />
        <MotionList className="grid grid-cols-2 gap-4">
          <MotionItem><StatCard label="Triagens realizadas" value={triagens} icon="ClipboardCheck" accent="accent" /></MotionItem>
          <MotionItem><StatCard label="Tarefas concluídas" value={tarefasConcluidas} icon="ListTodo" accent="primary" /></MotionItem>
          <MotionItem><StatCard label="Exames genéticos" value={examesGeneticos} icon="Dna" accent="secondary" /></MotionItem>
          <MotionItem><StatCard label="Solicitações de sala" value={solicitacoesSala} icon="Sparkles" accent="accent" /></MotionItem>
        </MotionList>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Sem eventos registrados ainda. Conforme a operação avança, a atividade aparece aqui.
              </div>
            ) : (
              <MotionList className="space-y-2.5">
                {timeline.slice(0, 6).map((e) => (
                  <MotionItem key={e.id}>
                    <div className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/40">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
                        <NavIcon name={KIND_ICON[e.kind ?? ""] ?? "CalendarClock"} className="h-4 w-4" />
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">{e.title}</span>
                      <Badge variant="outline">{e.kind ?? "evento"}</Badge>
                    </div>
                  </MotionItem>
                ))}
              </MotionList>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <SummaryRow label="Relatórios de triagem" value={relatorios.length} />
            <SummaryRow label="Relatórios pendentes" value={relatoriosPendentes} />
            <SummaryRow label="Laudos / documentos" value={documentos} />
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
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
