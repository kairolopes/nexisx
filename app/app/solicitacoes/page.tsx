import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/guard";
import { listSensoryRoomRequests } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

export default async function SolicitacoesPage() {
  await requireRole(["admin", "consultor"]);
  const requests = await listSensoryRoomRequests();

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
        <DataTable
          columns={["Contato", "E-mail", "Interesse", "Recebido", "Status"]}
          rows={requests.map((r) => [
            r.requester_name,
            r.email ?? "—",
            r.environment ?? "—",
            formatDate(r.created_at),
            <Badge key={r.id} variant={r.status === "novo" ? "warning" : "default"}>{r.status}</Badge>,
          ])}
        />
      )}
    </>
  );
}
