import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

const children = [
  { id: "1", name: "Helena Martins", age: "2a 8m", status: "Triagem", variant: "warning" as const },
  { id: "2", name: "Theo Souza", age: "5a", status: "Acompanhamento", variant: "success" as const },
  { id: "3", name: "Lívia Rocha", age: "3a 2m", status: "M-CHAT", variant: "default" as const },
  { id: "4", name: "Pedro Almeida", age: "6a", status: "Exoma", variant: "secondary" as const },
  { id: "5", name: "Manuela Dias", age: "4a", status: "Acompanhamento", variant: "success" as const },
  { id: "6", name: "Bento Lima", age: "2a 1m", status: "Triagem", variant: "warning" as const },
];

export default function CriancasPage() {
  return (
    <>
      <PageHeader
        title="Crianças / Neurodivergentes"
        description="Perfis em triagem e acompanhamento."
        action={<Button variant="gradient">Cadastrar criança</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((c) => (
          <Link key={c.id} href={`/app/criancas/${c.id}`}>
            <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-semibold text-white">
                  {initials(c.name)}
                </span>
                <div className="flex-1">
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.age}</p>
                </div>
                <Badge variant={c.variant}>{c.status}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
