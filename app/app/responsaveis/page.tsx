import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/guard";
import { listGuardians } from "@/lib/db/queries";
import { CreateGuardianDialog } from "@/components/app/create-guardian-dialog";

export default async function ResponsaveisPage() {
  await requireRole(["admin"]);
  const guardians = await listGuardians();

  return (
    <>
      <PageHeader
        title="Responsáveis"
        description="Famílias cadastradas."
        action={<CreateGuardianDialog />}
      />
      {guardians.length === 0 ? (
        <EmptyState
          title="Nenhum responsável cadastrado"
          description="Cadastre responsáveis para vinculá-los às crianças."
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
