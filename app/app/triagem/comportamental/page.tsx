import { PageHeader } from "@/components/app/page-header";
import { BehavioralScreening } from "@/components/app/behavioral-screening";
import { requireRole } from "@/lib/guard";
import { listChildren } from "@/lib/db/queries";

export default async function TriagemComportamentalPage() {
  // Defesa em camadas: além do menu por papel e do RLS, o guard impede acesso por URL.
  await requireRole(["admin", "responsavel", "profissional"]);
  const children = await listChildren();

  return (
    <>
      <PageHeader
        title="Triagem Digital Assistiva"
        description="Análise comportamental por vídeo curto (ou foto), combinada ao M-CHAT. É triagem assistiva — não substitui avaliação profissional."
      />
      <BehavioralScreening
        childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
      />
    </>
  );
}
