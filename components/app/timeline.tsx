import { ScanFace, ClipboardCheck, FileText, Stethoscope, BookHeart, CalendarClock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  kind: string | null;
  event_date: string;
}

const ICONS: Record<string, typeof CalendarClock> = {
  triagem: ClipboardCheck,
  facial: ScanFace,
  relatorio: FileText,
  consulta: Stethoscope,
  diario: BookHeart,
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Nenhum evento na linha do tempo ainda.
      </div>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e) => {
        const Icon = (e.kind && ICONS[e.kind]) || CalendarClock;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[31px] grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{e.title}</p>
              <span className="text-xs text-muted-foreground">{formatDate(e.event_date)}</span>
            </div>
            {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
