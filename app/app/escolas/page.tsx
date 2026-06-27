import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { requireRole } from "@/lib/guard";
import { listSchools, listChildren } from "@/lib/db/queries";
import { CreateSchoolDialog } from "@/components/app/create-school-dialog";
import { LinkSchoolDialog } from "@/components/app/link-school-dialog";

export default async function EscolasPage() {
  await requireRole(["admin"]);
  const [schools, children] = await Promise.all([listSchools(), listChildren()]);

  return (
    <>
      <PageHeader
        title="Escolas"
        description="Instituições parceiras."
        action={
          <div className="flex gap-2">
            {schools.length > 0 && children.length > 0 && (
              <LinkSchoolDialog schools={schools} childList={children} />
            )}
            <CreateSchoolDialog />
          </div>
        }
      />
      {schools.length === 0 ? (
        <EmptyState
          title="Nenhuma escola cadastrada"
          description="Cadastre escolas para vinculá-las às crianças acompanhadas."
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
