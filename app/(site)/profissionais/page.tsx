import type { Metadata } from "next";
import Link from "next/link";
import { Users, ClipboardCheck, FileSignature, Activity } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/effects/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Para Profissionais" };

const items = [
  { icon: Users, title: "Crianças vinculadas", desc: "Veja apenas os pacientes autorizados, com histórico completo." },
  { icon: ClipboardCheck, title: "Tarefas e atividades", desc: "Crie tarefas terapêuticas, sugira atividades e acompanhe o progresso." },
  { icon: FileSignature, title: "Pareceres e evolução", desc: "Registre evolução, emita pareceres e solicite documentos ou exames." },
  { icon: Activity, title: "Relatórios", desc: "Acompanhe relatórios evolutivos e dados consolidados por período." },
];

export default function ProfissionaisPage() {
  return (
    <>
      <PageHero
        eyebrow="Para Profissionais"
        title={<>Ferramentas clínicas que <span className="text-gradient">economizam tempo</span></>}
        subtitle="Gerencie pacientes, registre evolução e colabore com famílias e instituições em um só lugar."
      />
      <section className="container py-20">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {items.map((i) => (
            <StaggerItem key={i.title}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex gap-5 p-8">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 text-secondary">
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
          <Link href="/login"><Button variant="gradient" size="lg">Acessar área profissional</Button></Link>
        </Reveal>
      </section>
    </>
  );
}
