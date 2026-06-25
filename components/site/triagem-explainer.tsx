import { Lock, ScanFace, ClipboardCheck, FileText } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/site/notice";

const steps = [
  { icon: ScanFace, n: "01", title: "Análise facial assistiva", desc: "Auxilia na identificação de possíveis sinais a partir de uma foto." },
  { icon: ClipboardCheck, n: "02", title: "M-CHAT", desc: "Questionário de triagem com classificação de risco (baixo, moderado, alto)." },
  { icon: FileText, n: "03", title: "Relatório preliminar", desc: "Consolida os achados e orienta os próximos passos." },
];

export function TriagemExplainer() {
  return (
    <div>
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="accent" className="mb-4">
          <Lock className="h-3.5 w-3.5" /> Ambiente seguro com login
        </Badge>
        <h2 className="heading-lg">Como funciona a triagem</h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          A triagem é realizada dentro da plataforma, em ambiente protegido por login e
          com acesso por perfil. Aqui explicamos as etapas — o uso real é restrito a
          usuários autorizados.
        </p>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <StaggerItem key={s.n}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-elevation-3">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-2xl font-bold text-foreground/10">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="mx-auto mt-8 max-w-3xl">
        <Notice>
          A análise facial e o M-CHAT são instrumentos de triagem — não fecham diagnóstico
          e não substituem a avaliação de profissionais habilitados.
        </Notice>
      </Reveal>
    </div>
  );
}
