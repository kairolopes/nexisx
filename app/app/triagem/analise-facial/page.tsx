import { PageHeader } from "@/components/app/page-header";
import { FacialAnalysis } from "@/components/app/facial-analysis";
import { requireSession } from "@/lib/guard";
import { listChildren } from "@/lib/db/queries";

export default async function AnaliseFacialPage() {
  await requireSession();
  const children = await listChildren();

  return (
    <>
      <PageHeader
        title="Análise facial assistida"
        description="Envie a foto, registre o consentimento e obtenha um resultado preliminar."
      />
      <FacialAnalysis childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))} />
    </>
  );
}
