import type { Metadata } from "next";
import Link from "next/link";
import { School, Stethoscope, Home, Building2, Check, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";
import { SensoryGallery } from "@/components/site/sensory-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Salas Sensoriais" };

const environments = [
  { icon: School, title: "Escolas", desc: "Espaços de regulação e inclusão no ambiente escolar." },
  { icon: Stethoscope, title: "Clínicas e consultórios", desc: "Recursos terapêuticos para sessões mais eficazes." },
  { icon: Home, title: "Residências", desc: "Cantos sensoriais sob medida para o dia a dia em casa." },
  { icon: Building2, title: "Instituições públicas", desc: "Projetos acessíveis para atendimento coletivo." },
];

const benefits = [
  "Regulação sensorial e emocional",
  "Estímulo seguro e controlado",
  "Redução de crises e sobrecarga",
  "Apoio à concentração e ao foco",
  "Ambiente acolhedor e inclusivo",
  "Recursos táteis, auditivos e visuais",
];

const resources = [
  "Tubos de bolhas", "Fibra óptica", "Iluminação LED", "Painéis interativos",
  "Projetores", "Piso acolchoado", "Balanços terapêuticos", "Espaço de relaxamento",
  "Recursos táteis", "Recursos auditivos", "Recursos visuais", "Projetos personalizados",
];

export default function SalasSensoriaisPage() {
  return (
    <>
      <PageHero
        eyebrow="Salas Sensoriais"
        title={<>Ambientes que <span className="text-gradient">acolhem, regulam e estimulam</span></>}
        subtitle="Projetos personalizados de salas sensoriais para escolas, clínicas, consultórios, residências e instituições."
      />

      <section className="container py-20">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-bold">O que é uma sala sensorial?</h2>
          <p className="mt-4 text-muted-foreground">
            É um ambiente planejado com estímulos controlados — luz, som, textura e
            movimento — que ajuda na regulação sensorial e emocional de pessoas
            neurodivergentes, oferecendo segurança, conforto e bem-estar.
          </p>
        </Reveal>
        <Reveal>
          <SensoryGallery />
        </Reveal>
      </section>

      <section className="border-y border-border bg-muted/30 py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-bold">Para quem é indicada</h2>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {environments.map((e) => (
              <StaggerItem key={e.title}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 text-secondary">
                      <e.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container grid gap-12 py-20 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-3xl font-bold">Benefícios</h2>
          <ul className="mt-6 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-muted-foreground">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl font-bold">Recursos disponíveis</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {resources.map((r) => (
              <span key={r} className="rounded-full border border-border bg-card px-4 py-2 text-sm">
                {r}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container pb-24">
        <Reveal>
          <div className="rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-12 text-center text-white shadow-2xl">
            <h2 className="font-display text-3xl font-bold">Vamos projetar a sua sala sensorial?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Fale com um consultor e receba um projeto sob medida para o seu espaço.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/contato">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Solicitar projeto <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  Falar com consultor
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
