import { PageHeader } from "@/components/app/page-header";
import { FacialAnalysis } from "@/components/app/facial-analysis";

export default function AnaliseFacialPage() {
  return (
    <>
      <PageHeader
        title="Análise facial assistida"
        description="Envie a foto, registre o consentimento e obtenha um resultado preliminar."
      />
      <FacialAnalysis />
    </>
  );
}
