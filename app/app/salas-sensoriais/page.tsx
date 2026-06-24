import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { StatCard } from "@/components/app/stat-card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/guard";

const rows = [
  ["Escola Aurora", "Escola", "São Paulo", <Badge key="1" variant="warning">Orçamento</Badge>],
  ["Clínica Viver", "Clínica", "Curitiba", <Badge key="2" variant="success">Aprovado</Badge>],
  ["Família Lima", "Residência", "Recife", <Badge key="3" variant="default">Novo lead</Badge>],
];

export default async function SalasSensoriaisAdminPage() {
  await requireRole(["admin", "consultor"]);
  return (
    <>
      <PageHeader title="Salas sensoriais" description="Gestão de solicitações de projeto." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Solicitações" value={19} icon="Sparkles" />
        <StatCard label="Em orçamento" value={7} icon="Inbox" accent="accent" />
        <StatCard label="Aprovadas" value={5} icon="ShieldCheck" accent="secondary" />
      </div>
      <DataTable columns={["Solicitante", "Tipo", "Local", "Status"]} rows={rows} />
    </>
  );
}
