import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/app/timeline";

export default function LinhaDoTempoPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Linha do tempo" description="Histórico cronológico de eventos." />
      <Card>
        <CardContent className="p-8">
          <Timeline />
        </CardContent>
      </Card>
    </div>
  );
}
