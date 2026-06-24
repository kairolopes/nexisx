import type { Metadata } from "next";
import { Target, Eye, Heart, Layers } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sobre o NexisX" };

const pillars = [
  { icon: Target, title: "Missão", desc: "Democratizar o acesso à triagem e ao acompanhamento de qualidade em neurodesenvolvimento." },
  { icon: Eye, title: "Visão", desc: "Ser a plataforma de referência que conecta famílias, profissionais e instituições." },
  { icon: Heart, title: "Valores", desc: "Cuidado, ética, privacidade e respeito à neurodiversidade em cada decisão." },
  { icon: Layers, title: "Abordagem", desc: "Tecnologia que apoia — nunca substitui — o trabalho de profissionais habilitados." },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre o NexisX"
        title={<>Um portal que une <span className="text-gradient">ciência, tecnologia e cuidado</span></>}
        subtitle="O NexisX nasceu para organizar a jornada do neurodesenvolvimento em uma experiência única, segura e acolhedora."
      />
      <section className="container py-20">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mx-auto mt-20 max-w-3xl space-y-6 text-muted-foreground">
          <h2 className="font-display text-2xl font-bold text-foreground">O que oferecemos</h2>
          <p>
            Reunimos em um só lugar a triagem inteligente (com análise facial assistida e
            M-CHAT), a organização de exames genéticos, o acompanhamento contínuo do
            neurodivergente e projetos de salas sensoriais sob medida.
          </p>
          <p>
            Tudo isso com controle de acesso por papéis — administradores, responsáveis,
            profissionais, escolas e consultores —, garantindo que cada pessoa veja apenas
            o que lhe diz respeito.
          </p>
        </Reveal>
      </section>
    </>
  );
}
