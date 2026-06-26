import { PageHeader } from "@/components/app/page-header";
import { FacialAnalysis } from "@/components/app/facial-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/guard";
import { listChildren, listFacialAnalyses } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente de avaliação",
  concluido: "Foto recebida",
};

export default async function AnaliseFacialPage() {
  await requireSession();
  const [children, analyses] = await Promise.all([listChildren(), listFacialAnalyses()]);

  return (
    <>
      <PageHeader
        title="Análise facial assistida"
        description="Envie a foto com consentimento registrado. A análise será avaliada por um profissional habilitado."
      />
      <FacialAnalysis childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))} />

      <div className="mt-8">
        <h3 className="mb-3 font-display font-semibold">Histórico de análises</h3>
        {analyses.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma análise registrada ainda.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Últimas {analyses.length} análise{analyses.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Criança</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => {
                    const child = children.find((c) => c.id === a.child_id);
                    return (
                      <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2">{child?.full_name ?? "—"}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline">{STATUS_LABELS[a.status] ?? a.status}</Badge>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{formatDate(a.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
