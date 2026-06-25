import { HeartHandshake, Stethoscope, School, Building2, ShieldCheck, Lock, UserCheck } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/effects/reveal";

const builtFor = [
  { icon: HeartHandshake, label: "Projetado para famílias" },
  { icon: Stethoscope, label: "Projetado para profissionais" },
  { icon: School, label: "Projetado para escolas" },
  { icon: Building2, label: "Projetado para clínicas" },
];

const guarantees = [
  { icon: ShieldCheck, label: "LGPD by design" },
  { icon: Lock, label: "Dados protegidos" },
  { icon: UserCheck, label: "Acesso por perfil" },
];

export function Credibility() {
  return (
    <div className="container-premium">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="heading-lg">Construído com responsabilidade</h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Tecnologia a serviço do cuidado — com privacidade e segurança no centro de cada decisão.
        </p>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {builtFor.map((b) => (
          <StaggerItem key={b.label}>
            <div className="flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{b.label}</span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="mt-6">
        <div className="glass-card flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl px-6 py-5">
          {guarantees.map((g) => (
            <span key={g.label} className="inline-flex items-center gap-2 text-sm font-medium">
              <g.icon className="h-4 w-4 text-secondary" /> {g.label}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
