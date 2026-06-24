import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/app/timeline";
import { listTimelineEvents } from "@/lib/db/queries";

export default async function LinhaDoTempoPage() {
  const events = await listTimelineEvents();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Linha do tempo" description="Histórico cronológico de eventos." />
      <Card>
        <CardContent className="p-8">
          <Timeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
