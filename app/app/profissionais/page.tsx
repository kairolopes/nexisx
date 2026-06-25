import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";
import { listProfessionals } from "@/lib/db/queries";

export default async function ProfissionaisAdminPage() {
  await requireRole(["admin"]);
  const professionals = await listProfessionals();

  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Equipe vinculada à plataforma."
        action={<Button variant="gradient">Adicionar</Button>}
      />
      {professionals.length === 0 ? (
        <EmptyState
          title="Nenhum profissional cadastrado"
          description="Profissionais vinculados aparecerão aqui."
        />
      ) : (
        <DataTable
          columns={["Nome", "Especialidade", "Registro"]}
          rows={professionals.map((p) => [p.full_name, p.specialty ?? "—", p.registration ?? "—"])}
        />
      )}
    </>
  );
}
