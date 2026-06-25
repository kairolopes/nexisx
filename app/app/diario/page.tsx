import { PageHeader } from "@/components/app/page-header";
import { DiaryForm } from "@/components/app/diary-form";
import { requireRole } from "@/lib/guard";
import { listDiaryEntries, listChildren } from "@/lib/db/queries";

export default async function DiarioPage() {
  await requireRole(["admin", "responsavel"]);
  const [entries, children] = await Promise.all([listDiaryEntries(), listChildren()]);

  return (
    <>
      <PageHeader
        title="Diário dos pais"
        description="Registre o dia a dia: humor, sono, alimentação, crises e conquistas."
      />
      <DiaryForm
        entries={entries}
        childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
      />
    </>
  );
}
