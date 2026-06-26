import { PageHeader } from "@/components/app/page-header";
import { BehavioralScreening } from "@/components/app/behavioral-screening";
import { requireRole } from "@/lib/guard";
import { listChildren } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

export default async function TriagemComportamentalPage() {
  // Defesa em camadas: além do menu por papel e do RLS, o guard impede acesso por URL.
  await requireRole(["admin", "responsavel", "profissional"]);
  const children = await listChildren();

  return (
    <>
      <div className="flex flex-wrap items-start gap-3">
        <PageHeader
          title="Triagem Digital Assistiva"
          description="Análise comportamental por vídeo curto (ou foto), combinada ao M-CHAT. É triagem assistiva — não substitui avaliação profissional."
        />
        <Badge variant="outline" className="mt-1 shrink-0 gap-1.5 border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
          <FlaskConical className="h-3 w-3" />
          Preview Científico · Modelo Demonstrativo
        </Badge>
      </div>
      <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 text-sm text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300">
        <strong>Modelo demonstrativo:</strong> os sinais comportamentais exibidos nesta tela
        são gerados por um modelo simulado para fins de demonstração da plataforma. Nenhum
        resultado desta tela deve ser utilizado para fins clínicos. A IA real estará disponível
        após validação clínica por profissional habilitado.
      </div>
      <BehavioralScreening
        childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
      />
    </>
  );
}
