import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/app/timeline";

const profile = {
  name: "Helena Martins",
  dados: [
    ["Idade", "2 anos e 8 meses"],
    ["Escola", "Escola Aurora"],
    ["Responsáveis", "Ana Martins (mãe)"],
    ["Profissionais", "Dra. Carla (Neuroped.)"],
  ],
  clinico: [
    ["Diagnósticos informados", "Em investigação"],
    ["Hipóteses", "TEA (a confirmar)"],
    ["Medicamentos", "Nenhum informado"],
  ],
  sensorial: [
    ["Preferências sensoriais", "Estímulos visuais suaves"],
    ["Gatilhos", "Ruídos altos, multidão"],
    ["Comunicação", "Pré-verbal, gestos"],
    ["Alimentação", "Seletiva"],
    ["Sono", "Fragmentado"],
  ],
};

export default function ChildProfilePage() {
  return (
    <>
      <Link href="/app/criancas" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <PageHeader title={profile.name} description="Perfil completo e histórico." />

      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard title="Dados pessoais" rows={profile.dados} />
        <DetailCard title="Histórico clínico" rows={profile.clinico} />
        <DetailCard title="Perfil sensorial" rows={profile.sensorial} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status atual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="warning">Triagem em andamento</Badge>
            <Badge variant="default">M-CHAT: moderado</Badge>
            <Badge variant="secondary">Acompanhamento ativo</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DetailCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
