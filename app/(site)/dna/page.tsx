import type { Metadata } from "next";
import Link from "next/link";
import { Dna, Microscope, FileText, Sparkles } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";
import { Notice } from "@/components/site/notice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "DNA / Exoma / Genética" };

const concepts = [
  { title: "DNA", desc: "O código genético que carrega as instruções do organismo." },
  { title: "Exoma", desc: "A porção do DNA que codifica proteínas — onde estão a maioria das variantes clínicas." },
  { title: "Genoma", desc: "O conjunto completo do material genético." },
  { title: "CGH Array", desc: "Exame que detecta perdas e ganhos de material cromossômico." },
];

const whenToInvestigate = [
  "Atraso do desenvolvimento",
  "Deficiência intelectual",
  "Sinais associados ao TEA",
  "Suspeita de síndromes genéticas",
  "Histórico familiar relevante",
  "Achados clínicos inespecíficos",
];

export default function DnaPage() {
  return (
    <>
      <PageHero
        eyebrow="DNA · Exoma · Genética"
        title={<>Genética que <span className="text-gradient">orienta os próximos passos</span></>}
        subtitle="Entenda os exames, organize laudos e receba resumos claros — para a família e para o profissional."
      />

      <section className="container py-20">
        <Reveal>
          <Notice>
            O NexisX não substitui médico geneticista, neuropediatra, pediatra, psicólogo
            ou qualquer profissional habilitado. A plataforma organiza informações e
            auxilia na orientação dos próximos passos.
          </Notice>
        </Reveal>

        <h2 className="mt-16 font-display text-3xl font-bold">Conceitos essenciais</h2>
        <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <StaggerItem key={c.title}>
              <Card className="h-full">
                <CardContent className="p-7">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-accent/15 to-primary/15 text-accent">
                    <Dna className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="border-y border-border bg-muted/30 py-20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-bold">Quando investigar</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {whenToInvestigate.map((w) => (
                <li key={w} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
                  <Microscope className="h-4 w-4 text-primary" /> {w}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl font-bold">Como o NexisX ajuda</h2>
            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                <FileText className="h-6 w-6 shrink-0 text-secondary" />
                <p className="text-sm text-muted-foreground">
                  Centraliza laudos e histórico genético em um único prontuário seguro.
                </p>
              </div>
              <div className="flex gap-4">
                <Sparkles className="h-6 w-6 shrink-0 text-accent" />
                <p className="text-sm text-muted-foreground">
                  Gera resumos em linguagem acessível para a família e resumos técnicos
                  para o profissional — sempre indicando a necessidade de avaliação
                  especializada.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold">Precisa organizar exames genéticos?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Solicite um exame ou faça upload de um laudo diretamente na plataforma.
          </p>
          <Link href="/login" className="mt-8 inline-block">
            <Button variant="gradient" size="lg">Acessar plataforma</Button>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
