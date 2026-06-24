import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/site/notice";
import { requireRole } from "@/lib/guard";
import { listGeneticExamRequests, listChildren } from "@/lib/db/queries";
import { GeneticRequestForm } from "@/components/app/genetic-request-form";
import { formatDate } from "@/lib/utils";

export default async function GeneticaPage() {
  await requireRole(["admin", "responsavel", "profissional", "consultor"]);
  const [requests, children] = await Promise.all([listGeneticExamRequests(), listChildren()]);

  return (
    <>
      <PageHeader
        title="Exames genéticos"
        description="Solicitações de exames e acompanhamento do status."
        action={<GeneticRequestForm childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))} />}
      />
      <Notice className="mb-6">
        O NexisX organiza informações e não substitui médico geneticista ou neuropediatra.
      </Notice>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
            Nenhuma solicitação de exame ainda.
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={["Exame", "Solicitado em", "Status"]}
          rows={requests.map((r) => [
            r.exam_type ?? "—",
            formatDate(r.created_at),
            <Badge key={r.id} variant={r.status === "solicitado" ? "warning" : "success"}>{r.status}</Badge>,
          ])}
        />
      )}
    </>
  );
}
