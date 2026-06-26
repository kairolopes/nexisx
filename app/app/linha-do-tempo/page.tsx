import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TimelineBoard } from "@/components/app/timeline-board";
import { requireSession } from "@/lib/guard";
import { listTimelineEvents, listChildren } from "@/lib/db/queries";

export default async function LinhaDoTempoPage() {
  await requireSession();
  const [events, children] = await Promise.all([listTimelineEvents(), listChildren()]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Linha do tempo" description="Histórico cronológico de eventos." />
      <Card>
        <CardContent className="p-8">
          <TimelineBoard
            events={events}
            childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
