import { PageHeader } from "@/components/app/page-header";
import { MchatForm } from "@/components/app/mchat-form";
import { requireSession } from "@/lib/guard";
import { listChildren } from "@/lib/db/queries";

export default async function MchatPage() {
  const { profile } = await requireSession();
  const children = await listChildren();
  const canCreateReport = profile.role === "admin" || profile.role === "profissional";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="M-CHAT"
        description="Questionário de triagem com salvamento automático e classificação de risco."
      />
      <MchatForm
        childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
        canCreateReport={canCreateReport}
      />
    </div>
  );
}
