import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";
import { listGuardians } from "@/lib/db/queries";

export default async function ResponsaveisPage() {
  await requireRole(["admin"]);
  const guardians = await listGuardians();

  return (
    <>
      <PageHeader
        title="Responsáveis"
        description="Famílias cadastradas."
        action={<Button variant="gradient">Adicionar</Button>}
      />
      {guardians.length === 0 ? (
        <EmptyState
          title="Nenhum responsável cadastrado"
          description="Responsáveis cadastrados (ou do seed de desenvolvimento) aparecerão aqui."
        />
      ) : (
        <DataTable
          columns={["Nome", "Vínculo", "Telefone", "E-mail"]}
          rows={guardians.map((g) => [g.full_name, g.relationship ?? "—", g.phone ?? "—", g.email ?? "—"])}
        />
      )}
    </>
  );
}
