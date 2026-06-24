import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  { n: 1, title: "Login do responsável/profissional", done: true },
  { n: 2, title: "Cadastro da criança", done: true },
  { n: 3, title: "Dados do responsável", done: true },
  { n: 4, title: "Termo de consentimento", done: true },
  { n: 5, title: "Upload de foto (análise facial)", href: "/app/triagem/analise-facial" },
  { n: 6, title: "Resultado preliminar da análise facial", href: "/app/triagem/analise-facial" },
  { n: 7, title: "Aplicação do M-CHAT", href: "/app/triagem/mchat" },
  { n: 8, title: "Resultado do M-CHAT", href: "/app/triagem/mchat" },
  { n: 9, title: "Relatório preliminar", href: "/app/triagem/relatorios" },
  { n: 10, title: "Encaminhamento para próximos passos", href: "/app/triagem/relatorios" },
];

export default function TriagemPage() {
  return (
    <>
      <PageHeader
        title="Triagem inteligente"
        description="Fluxo completo de triagem — da identificação aos próximos passos."
        action={
          <Link href="/app/triagem/analise-facial">
            <Button variant="gradient">Iniciar triagem</Button>
          </Link>
        }
      />

      <div className="grid gap-4">
        {steps.map((s) => (
          <Card key={s.n} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-bold ${
                  s.done
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {s.n}
              </span>
              <div className="flex-1">
                <p className="font-medium">{s.title}</p>
              </div>
              {s.done ? (
                <Badge variant="success">Concluído</Badge>
              ) : s.href ? (
                <Link href={s.href}>
                  <Button variant="outline" size="sm">
                    Abrir
                  </Button>
                </Link>
              ) : (
                <Badge variant="outline">Pendente</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
