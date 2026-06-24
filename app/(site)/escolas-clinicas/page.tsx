import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, MessageSquare, Users2, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/effects/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Para Escolas e Clínicas" };

const items = [
  { icon: GraduationCap, title: "Comportamento escolar", desc: "Registre adaptação, rotina e desempenho no ambiente escolar." },
  { icon: Users2, title: "Interação social", desc: "Acompanhe comunicação, socialização e dificuldades observadas." },
  { icon: MessageSquare, title: "Observações", desc: "Compartilhe registros com famílias e profissionais com segurança." },
  { icon: Sparkles, title: "Salas sensoriais", desc: "Implemente ambientes de regulação dentro da instituição." },
];

export default function EscolasClinicasPage() {
  return (
    <>
      <PageHero
        eyebrow="Para Escolas e Clínicas"
        title={<>Inclusão e acompanhamento <span className="text-gradient">com dados confiáveis</span></>}
        subtitle="Registre comportamento, adaptação e interação social — sempre respeitando a privacidade de cada criança."
      />
      <section className="container py-20">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {items.map((i) => (
            <StaggerItem key={i.title}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex gap-5 p-8">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent/15 to-secondary/15 text-accent">
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
          <Link href="/contato"><Button variant="gradient" size="lg">Falar com o NexisX</Button></Link>
        </Reveal>
      </section>
    </>
  );
}
