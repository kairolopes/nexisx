import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Notice } from "@/components/site/notice";
import { requireSession } from "@/lib/guard";
import { loadScreeningReportView } from "@/lib/reports/screening-data";
import { formatDate } from "@/lib/utils";

const priorityVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  baixo: "success",
  moderado: "warning",
  alto: "danger",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default async function RelatorioTriagemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireSession();
  const view = await loadScreeningReportView(params.id);
  if (!view) notFound();

  return (
    <>
      <Link
        href="/app/triagem/relatorios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para relatórios
      </Link>

      <PageHeader
        title={view.childName}
        description={`Relatório preliminar de triagem · gerado em ${formatDate(view.generatedAt)}`}
        action={
          <a
            href={`/app/triagem/relatorios/${view.id}/pdf`}
            className={buttonVariants({ variant: "gradient" })}
          >
            <Download className="h-4 w-4" /> Baixar PDF
          </a>
        }
      />

      <Notice className="mb-6">
        Este relatório é preliminar e não substitui avaliação de profissionais habilitados.
      </Notice>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Identificação</CardTitle>
            {view.priorityValue && (
              <Badge variant={priorityVariant[view.priorityValue] ?? "default"}>
                Prioridade {view.priorityLabel}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="text-sm">
            <Field label="Criança" value={view.childName} />
            <Field label="Gerado em" value={formatDate(view.generatedAt)} />
          </CardContent>
        </Card>

        {view.mchat && (
          <Card>
            <CardHeader>
              <CardTitle>M-CHAT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {view.mchat.score !== null && <Field label="Pontuação" value={String(view.mchat.score)} />}
              {view.mchat.riskLabel && <Field label="Nível de risco" value={view.mchat.riskLabel} />}
              {view.mchat.completedAt && (
                <Field label="Concluído em" value={formatDate(view.mchat.completedAt)} />
              )}
            </CardContent>
          </Card>
        )}

        {view.facial && (
          <Card>
            <CardHeader>
              <CardTitle>Análise facial</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Field label="Status" value={view.facial.status} />
              {view.facial.result && <Field label="Resultado" value={view.facial.result} />}
              {view.facial.observations && (
                <p className="pt-3 text-muted-foreground">{view.facial.observations}</p>
              )}
            </CardContent>
          </Card>
        )}

        {(view.recommendation || view.nextSteps) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conclusão preliminar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {view.recommendation && (
                <div>
                  <p className="font-semibold">Recomendação</p>
                  <p className="mt-1 text-muted-foreground">{view.recommendation}</p>
                </div>
              )}
              {view.nextSteps && (
                <div>
                  <p className="font-semibold">Próximos passos</p>
                  <p className="mt-1 text-muted-foreground">{view.nextSteps}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
