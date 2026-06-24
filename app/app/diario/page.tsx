import { PageHeader } from "@/components/app/page-header";
import { DiaryForm } from "@/components/app/diary-form";

export default function DiarioPage() {
  return (
    <>
      <PageHeader
        title="Diário dos pais"
        description="Registre o dia a dia: humor, sono, alimentação, crises e conquistas."
      />
      <DiaryForm />
    </>
  );
}
