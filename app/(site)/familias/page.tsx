import type { Metadata } from "next";
import Link from "next/link";
import { BookHeart, ListChecks, LineChart, CalendarClock } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/effects/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Para Famílias" };

const items = [
  { icon: BookHeart, title: "Diário dos pais", desc: "Registre humor, sono, alimentação, crises, gatilhos e conquistas do dia." },
  { icon: ListChecks, title: "Tarefas e rotina", desc: "Acompanhe atividades em casa, na escola e na terapia com checklists e recompensas." },
  { icon: LineChart, title: "Relatórios evolutivos", desc: "Veja a evolução por período, pontos de melhora e de atenção." },
  { icon: CalendarClock, title: "Linha do tempo", desc: "Triagens, consultas, terapias e documentos reunidos em ordem cronológica." },
];

export default function FamiliasPage() {
  return (
    <>
      <PageHero
        eyebrow="Para Famílias"
        title={<>Acompanhe cada passo com <span className="text-gradient">clareza e acolhimento</span></>}
        subtitle="Um espaço seguro para registrar o dia a dia, acompanhar a evolução e entender os próximos passos."
      />
      <section className="container py-20">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {items.map((i) => (
            <StaggerItem key={i.title}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex gap-5 p-8">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <i.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{i.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt-14 text-center">
          <Link href="/login"><Button variant="gradient" size="lg">Acessar área da família</Button></Link>
        </Reveal>
      </section>
    </>
  );
}
