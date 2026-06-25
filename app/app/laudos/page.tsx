import { PageHeader } from "@/components/app/page-header";
import { Notice } from "@/components/site/notice";
import { FileUploader } from "@/components/app/file-uploader";
import { DocumentsList } from "@/components/app/documents-list";
import { requireRole } from "@/lib/guard";
import { listGeneticReports, listChildren } from "@/lib/db/queries";
import { BUCKETS } from "@/lib/storage";

export default async function LaudosPage() {
  const { profile } = await requireRole(["admin", "profissional", "consultor"]);
  const [reports, children] = await Promise.all([listGeneticReports(), listChildren()]);
  const canUpload = profile.role === "admin" || profile.role === "profissional";

  return (
    <>
      <PageHeader
        title="Laudos"
        description="Upload e organização segura de laudos genéticos (PDF/imagem)."
      />
      <Notice className="mb-6">
        O NexisX organiza laudos; a interpretação cabe a profissionais habilitados.
      </Notice>

      {canUpload && (
        <div className="mb-6">
          <FileUploader
            childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
            kind="genetic"
          />
        </div>
      )}

      <DocumentsList docs={reports} bucket={BUCKETS.genetic} emptyText="Nenhum laudo enviado ainda." />
    </>
  );
}
