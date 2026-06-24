import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";

const rows = [
  ["Dra. Carla Nunes", "Neuropediatra", "CRM 00000", <Badge key="1" variant="success">Ativo</Badge>],
  ["Bruno Tavares", "Psicólogo", "CRP 00000", <Badge key="2" variant="success">Ativo</Badge>],
  ["Sofia Andrade", "Fonoaudióloga", "CRFa 00000", <Badge key="3" variant="warning">Pendente</Badge>],
];

export default async function ProfissionaisAdminPage() {
  await requireRole(["admin"]);
  return (
    <>
      <PageHeader title="Profissionais" description="Equipe vinculada à plataforma." action={<Button variant="gradient">Adicionar</Button>} />
      <DataTable columns={["Nome", "Especialidade", "Registro", "Status"]} rows={rows} />
    </>
  );
}
