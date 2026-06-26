import { ScanFace, ClipboardCheck, FileText, Stethoscope, BookHeart, CalendarClock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function Timeline({
  events,
  onDelete,
}: {
  events: TimelineEvent[];
  onDelete?: (id: string) => void;
}) {
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
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{formatDate(e.event_date)}</span>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    aria-label="Excluir evento"
                    onClick={() => onDelete(e.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
