import {
  UserPlus,
  ScanFace,
  ClipboardCheck,
  FileText,
  Dna,
  Sparkles,
  LineChart,
  Gamepad2,
} from "lucide-react";
import { Reveal } from "@/components/effects/reveal";

const steps = [
  { icon: UserPlus, title: "Cadastro", desc: "A família ou o profissional cria o perfil da criança em ambiente seguro." },
  { icon: ScanFace, title: "Análise facial assistiva", desc: "Identificação de possíveis sinais — auxílio, nunca diagnóstico." },
  { icon: ClipboardCheck, title: "M-CHAT", desc: "Questionário de triagem com classificação de risco." },
  { icon: FileText, title: "Relatório preliminar", desc: "Consolidação dos achados e nível de prioridade." },
  { icon: Dna, title: "DNA / Exoma quando indicado", desc: "Organização de laudos e resumos para família e profissional." },
  { icon: Sparkles, title: "Sala sensorial", desc: "Projeto sob medida para regulação e bem-estar." },
  { icon: LineChart, title: "Acompanhamento contínuo", desc: "Linha do tempo, evolução e relatórios ao longo do tempo." },
  { icon: Gamepad2, title: "Tarefas, jogos e evolução", desc: "Rotina, atividades e engajamento no dia a dia." },
];

export function Journey() {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* linha central */}
      <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-accent/30 to-secondary/40 md:left-1/2" />

      <ol className="space-y-6">
        {steps.map((s, i) => {
          const left = i % 2 === 0;
          return (
            <li key={s.title} className="relative md:grid md:grid-cols-2 md:gap-8">
              <Reveal delay={i * 0.04} className={left ? "md:col-start-1" : "md:col-start-2"}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-elevation-1 transition-all hover:-translate-y-0.5 hover:shadow-elevation-2 md:ml-0">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Etapa {i + 1}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
              {/* nó central */}
              <span className="absolute left-[22px] top-6 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent md:left-1/2" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
