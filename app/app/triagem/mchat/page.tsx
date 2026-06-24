import { PageHeader } from "@/components/app/page-header";
import { MchatForm } from "@/components/app/mchat-form";

export default function MchatPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="M-CHAT"
        description="Questionário de triagem com salvamento automático e classificação de risco."
      />
      <MchatForm />
    </div>
  );
}
