import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/site/notice";
import { requireRole } from "@/lib/guard";

const rows = [
  ["Helena Martins", "Exoma", "Solicitado", <Badge key="1" variant="warning">Em análise</Badge>],
  ["Pedro Almeida", "CGH Array", "Laudo recebido", <Badge key="2" variant="success">Concluído</Badge>],
  ["Lívia Rocha", "Painel TEA", "Aguardando coleta", <Badge key="3" variant="default">Pendente</Badge>],
];

export default async function GeneticaPage() {
  await requireRole(["admin", "responsavel", "profissional", "consultor"]);
  return (
    <>
      <PageHeader
        title="Exames genéticos"
        description="Solicitações de exames e acompanhamento do status."
        action={<Button variant="gradient">Solicitar exame</Button>}
      />
      <Notice className="mb-6">
        O NexisX organiza informações e não substitui médico geneticista ou neuropediatra.
      </Notice>
      <DataTable columns={["Paciente", "Exame", "Etapa", "Status"]} rows={rows} />
    </>
  );
}
