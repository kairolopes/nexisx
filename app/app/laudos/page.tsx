import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";

const rows = [
  ["Pedro Almeida", "CGH Array", "08 jun 2026", <Badge key="1" variant="success">Resumo gerado</Badge>],
  ["Theo Souza", "Exoma", "02 jun 2026", <Badge key="2" variant="default">Em revisão</Badge>],
];

export default async function LaudosPage() {
  await requireRole(["admin", "profissional", "consultor"]);
  return (
    <>
      <PageHeader
        title="Laudos"
        description="Upload, organização e resumos (família e técnico)."
        action={<Button variant="gradient">Enviar laudo</Button>}
      />
      <DataTable columns={["Paciente", "Exame", "Data", "Status"]} rows={rows} />
    </>
  );
}
