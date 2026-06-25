import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";
import { listSchools } from "@/lib/db/queries";

export default async function EscolasPage() {
  await requireRole(["admin"]);
  const schools = await listSchools();

  return (
    <>
      <PageHeader
        title="Escolas"
        description="Instituições parceiras."
        action={<Button variant="gradient">Adicionar</Button>}
      />
      {schools.length === 0 ? (
        <EmptyState
          title="Nenhuma escola cadastrada"
          description="Instituições parceiras aparecerão aqui."
        />
      ) : (
        <DataTable
          columns={["Escola", "Cidade", "Contato"]}
          rows={schools.map((s) => [s.name, s.city ?? "—", s.contact_email ?? "—"])}
        />
      )}
    </>
  );
}
