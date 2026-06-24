import Link from "next/link";
import {
  Brain,
  ScanFace,
  ClipboardCheck,
  Dna,
  Sparkles,
  HeartHandshake,
  LineChart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ParticleField } from "@/components/effects/particle-field";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ScanFace,
    title: "Análise facial assistida",
    desc: "Identificação de possíveis sinais a partir de imagem, com encaminhamento orientado — nunca diagnóstico.",
  },
  {
    icon: ClipboardCheck,
    title: "M-CHAT inteligente",
    desc: "Questionário de triagem com progresso, salvamento automático e classificação de risco.",
  },
  {
    icon: Dna,
    title: "Genética e Exoma",
    desc: "Solicitação de exames, organização de laudos e resumos para família e profissionais.",
  },
  {
    icon: Sparkles,
    title: "Salas sensoriais",
    desc: "Projetos personalizados para escolas, clínicas, consultórios e residências.",
  },
  {
    icon: LineChart,
    title: "Acompanhamento contínuo",
    desc: "Linha do tempo, tarefas, rotina, jogos e relatórios evolutivos em um só lugar.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade por padrão",
    desc: "Controle de acesso por papéis e RLS no banco — cada um vê apenas o que pode.",
  },
];

const audiences = [
  { icon: HeartHandshake, title: "Famílias", href: "/familias", desc: "Acompanhe a evolução, registre o dia a dia e tenha orientação dos próximos passos." },
  { icon: Brain, title: "Profissionais", href: "/profissionais", desc: "Gerencie crianças vinculadas, registre evolução e emita pareceres." },
  { icon: ShieldCheck, title: "Escolas e Clínicas", href: "/escolas-clinicas", desc: "Registre comportamento, adaptação e interação social com segurança." },
];

const stats = [
  { value: "6", label: "sistemas integrados" },
  { value: "100%", label: "acesso por papéis (RLS)" },
  { value: "24/7", label: "acompanhamento contínuo" },
  { value: "LGPD", label: "privacidade por padrão" },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="pointer-events-none absolute inset-0">
          <ParticleField className="h-full w-full opacity-70" />
        </div>
        <div className="container relative flex flex-col items-center pb-24 pt-40 text-center">
          <Reveal>
            <Badge variant="accent" className="mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma de neurodesenvolvimento
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Tecnologia, neurodesenvolvimento e{" "}
              <span className="text-gradient">ambientes sensoriais</span> em uma única
              plataforma.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              O NexisX une triagem inteligente, análise facial, M-CHAT, genética, salas
              sensoriais e acompanhamento para apoiar famílias, profissionais e
              instituições.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/sobre">
                <Button variant="gradient" size="lg">
                  Conhecer o NexisX <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="lg">
                  Falar com especialista
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg">
                  Acessar plataforma
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.3} className="mt-20 w-full">
            <div className="glass mx-auto grid max-w-3xl grid-cols-2 gap-6 rounded-3xl p-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4">Tudo conectado</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Um ecossistema completo de neurodesenvolvimento
          </h2>
          <p className="mt-4 text-muted-foreground">
            Da triagem ao acompanhamento contínuo, cada módulo conversa com os demais —
            com segurança e foco no cuidado.
          </p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="p-8">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-transform group-hover:scale-110">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* AUDIENCES */}
      <section className="border-y border-border bg-muted/30 py-24">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Feito para quem cuida
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cada perfil enxerga exatamente o que precisa — nem mais, nem menos.
            </p>
          </Reveal>
          <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {audiences.map((a) => (
              <StaggerItem key={a.title}>
                <Link href={a.href}>
                  <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-8">
                      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 text-secondary">
                        <a.icon className="h-6 w-6" />
                      </div>
                      <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                        {a.title}
                        <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-12 text-center text-white shadow-2xl shadow-accent/20 md:p-16">
            <div className="absolute inset-0 opacity-20 shimmer" />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Pronto para transformar o cuidado em neurodesenvolvimento?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              Comece pela triagem, organize laudos genéticos ou projete uma sala sensorial.
              O NexisX cresce com você.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Acessar plataforma
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  Falar com especialista
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
