import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";

const rows = [
  ["Mariana C.", "Sala sensorial", "mariana@email.com", <Badge key="1" variant="warning">Novo</Badge>],
  ["Inst. Esperança", "Exoma + sala", "contato@esperanca.org", <Badge key="2" variant="default">Em contato</Badge>],
  ["Dr. Rafael", "Parceria clínica", "rafael@clinica.com", <Badge key="3" variant="success">Convertido</Badge>],
];

export default function SolicitacoesPage() {
  return (
    <>
      <PageHeader title="Solicitações comerciais" description="Leads de salas sensoriais e exames." />
      <DataTable columns={["Contato", "Interesse", "E-mail", "Status"]} rows={rows} />
    </>
  );
}
