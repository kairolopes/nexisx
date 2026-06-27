import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/guard";
import { listSensoryRoomRequests } from "@/lib/db/queries";
import { SensoryRequestList } from "@/components/app/sensory-request-list";

export default async function SolicitacoesPage() {
  const { profile } = await requireRole(["admin", "consultor"]);
  const requests = await listSensoryRoomRequests();
  const canManage = profile.role === "admin" || profile.role === "consultor";

  return (
    <>
      <PageHeader title="Solicitações comerciais" description="Leads de salas sensoriais e contato." />
      {requests.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
            Nenhuma solicitação recebida ainda.
          </CardContent>
        </Card>
      ) : (
        <SensoryRequestList requests={requests} canManage={canManage} />
      )}
    </>
  );
}
