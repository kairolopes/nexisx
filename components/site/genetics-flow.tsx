import { Fragment } from "react";
import { Upload, FolderTree, Users, Stethoscope, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";

const nodes = [
  { icon: Upload, title: "Laudo recebido", desc: "Upload seguro de PDF ou imagem." },
  { icon: FolderTree, title: "Organização", desc: "Centralização no prontuário da criança." },
  { icon: Users, title: "Resumo para família", desc: "Linguagem acessível e acolhedora." },
  { icon: Stethoscope, title: "Resumo técnico", desc: "Síntese para o profissional habilitado." },
];

export function GeneticsFlow() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
      {nodes.map((n, i) => (
        <Fragment key={n.title}>
          <Reveal delay={i * 0.08} className="flex-1">
            <div className="h-full rounded-2xl border border-border bg-card p-6 text-center shadow-elevation-1 transition-all hover:-translate-y-1 hover:shadow-elevation-3">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent/15 to-primary/15 text-accent">
                <n.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-semibold">{n.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{n.desc}</p>
            </div>
          </Reveal>
          {i < nodes.length - 1 && (
            <div className="flex items-center justify-center text-muted-foreground/50">
              <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
