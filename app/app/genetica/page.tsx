import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Notice } from "@/components/site/notice";
import { requireRole } from "@/lib/guard";
import { listGeneticExamRequests, listChildren } from "@/lib/db/queries";
import { GeneticRequestForm } from "@/components/app/genetic-request-form";
import { GeneticExamList } from "@/components/app/genetic-exam-list";

export default async function GeneticaPage() {
  const { profile } = await requireRole(["admin", "responsavel", "profissional", "consultor"]);
  const [requests, children] = await Promise.all([listGeneticExamRequests(), listChildren()]);
  const canManage = profile.role === "admin" || profile.role === "profissional";

  return (
    <>
      <PageHeader
        title="Exames genéticos"
        description="Solicitações de exames, status e resumos (família e técnico)."
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
        <GeneticExamList requests={requests} canManage={canManage} />
      )}
    </>
  );
}
