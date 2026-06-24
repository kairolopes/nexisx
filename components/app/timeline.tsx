import { ScanFace, ClipboardCheck, FileText, Stethoscope, BookHeart } from "lucide-react";

const events = [
  { icon: ScanFace, title: "Análise facial realizada", date: "12 jun 2026", desc: "Sinais de atenção moderada identificados." },
  { icon: ClipboardCheck, title: "M-CHAT aplicado", date: "12 jun 2026", desc: "Pontuação 5/20 — risco moderado." },
  { icon: FileText, title: "Relatório preliminar gerado", date: "13 jun 2026", desc: "Encaminhamento para neuropediatra." },
  { icon: Stethoscope, title: "Consulta agendada", date: "20 jun 2026", desc: "Avaliação com Dra. Carla." },
  { icon: BookHeart, title: "Registro dos pais", date: "22 jun 2026", desc: "Boa noite de sono; aceitou novo alimento." },
];

export function Timeline() {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[31px] grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
            <e.icon className="h-4 w-4" />
          </span>
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">{e.title}</p>
            <span className="text-xs text-muted-foreground">{e.date}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
        </li>
      ))}
    </ol>
  );
}
