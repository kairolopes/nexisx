import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/empty-state";
import { MotionList, MotionItem } from "@/components/app/motion";
import { Notice } from "@/components/site/notice";
import { requireSession } from "@/lib/guard";
import { listScreeningReports, listChildren } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

const priorityVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  baixo: "success",
  moderado: "warning",
  alto: "danger",
};

export default async function RelatorioTriagemPage() {
  await requireSession();
  const [reports, children] = await Promise.all([listScreeningReports(), listChildren()]);
  const nameById = new Map(children.map((c) => [c.id, c.full_name]));

  return (
    <>
      <PageHeader
        title="Relatórios de triagem"
        description="Documentos preliminares gerados a partir do M-CHAT e da análise facial."
      />
      <Notice className="mb-6">
        Estes relatórios são preliminares e não substituem avaliação de profissionais habilitados.
      </Notice>

      {reports.length === 0 ? (
        <EmptyState
          title="Nenhum relatório de triagem ainda"
          description="Ao concluir um M-CHAT e salvá-lo, o relatório preliminar aparece aqui."
        />
      ) : (
        <MotionList className="grid gap-4 lg:grid-cols-2">
          {reports.map((r) => (
            <MotionItem key={r.id}>
            <Card className="h-full transition-colors hover:border-primary/30">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{r.child_id ? nameById.get(r.child_id) ?? "Criança" : "Triagem"}</CardTitle>
                {r.priority && (
                  <Badge variant={priorityVariant[r.priority] ?? "default"}>{r.priority}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">Gerado em</span>
                  <span className="font-medium">{formatDate(r.created_at)}</span>
                </div>
                {r.recommendation && (
                  <p className="pt-2 text-muted-foreground">{r.recommendation}</p>
                )}
                {r.next_steps && <p className="text-muted-foreground">{r.next_steps}</p>}
              </CardContent>
            </Card>
            </MotionItem>
          ))}
        </MotionList>
      )}
    </>
  );
}
