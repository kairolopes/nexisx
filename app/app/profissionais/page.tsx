import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/guard";
import { listProfessionals, listChildren } from "@/lib/db/queries";
import { CreateProfessionalDialog } from "@/components/app/create-professional-dialog";
import { LinkProfessionalDialog } from "@/components/app/link-professional-dialog";

export default async function ProfissionaisAdminPage() {
  await requireRole(["admin"]);
  const [professionals, children] = await Promise.all([listProfessionals(), listChildren()]);

  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Equipe vinculada à plataforma."
        action={
          <div className="flex gap-2">
            {professionals.length > 0 && children.length > 0 && (
              <LinkProfessionalDialog professionals={professionals} childList={children} />
            )}
            <CreateProfessionalDialog />
          </div>
        }
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
