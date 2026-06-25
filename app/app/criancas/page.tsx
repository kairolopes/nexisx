import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { listChildren } from "@/lib/db/queries";
import { childAge } from "@/lib/age";

export default async function CriancasPage() {
  const children = await listChildren();

  return (
    <>
      <PageHeader
        title="Crianças / Neurodivergentes"
        description="Perfis em triagem e acompanhamento."
        action={<Button variant="gradient">Cadastrar criança</Button>}
      />

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold">Nenhuma criança cadastrada</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Quando uma criança for cadastrada (ou os dados de exemplo forem carregados),
              ela aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c) => (
            <Link key={c.id} href={`/app/criancas/${c.id}`}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-6">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg">{initials(c.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-display font-semibold">{c.full_name}</p>
                    <p className="text-sm text-muted-foreground">{childAge(c.birth_date)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
