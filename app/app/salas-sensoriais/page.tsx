import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/guard";
import { listSensoryRoomRequests } from "@/lib/db/queries";
import { SensoryRequestList } from "@/components/app/sensory-request-list";

export default async function SalasSensoriaisAdminPage() {
  const { profile } = await requireRole(["admin", "consultor"]);
  const requests = await listSensoryRoomRequests();
  const canManage = profile.role === "admin" || profile.role === "consultor";
  const novos = requests.filter((r) => r.status === "novo").length;
  const aprovados = requests.filter((r) => r.status === "aprovado").length;

  return (
    <>
      <PageHeader title="Salas sensoriais" description="Gestão de solicitações de projeto." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Solicitações" value={requests.length} icon="Sparkles" />
        <StatCard label="Novos" value={novos} icon="Inbox" accent="accent" />
        <StatCard label="Aprovados" value={aprovados} icon="ShieldCheck" accent="secondary" />
      </div>
      {requests.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
            Nenhuma solicitação de sala sensorial ainda.
          </CardContent>
        </Card>
      ) : (
        <SensoryRequestList requests={requests} canManage={canManage} />
      )}
    </>
  );
}
