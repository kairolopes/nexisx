import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/types";
import { requireRole } from "@/lib/guard";

const rows = [
  ["admin@nexisx.com.br", <Badge key="1">{ROLE_LABELS.admin}</Badge>, "Tudo"],
  ["ana@email.com", <Badge key="2" variant="secondary">{ROLE_LABELS.responsavel}</Badge>, "Seus filhos"],
  ["carla@clinica.com", <Badge key="3" variant="accent">{ROLE_LABELS.profissional}</Badge>, "Crianças vinculadas"],
  ["aurora@escola.edu", <Badge key="4" variant="outline">{ROLE_LABELS.escola}</Badge>, "Crianças autorizadas"],
  ["consultor@nexisx.com.br", <Badge key="5" variant="warning">{ROLE_LABELS.consultor}</Badge>, "Solicitações comerciais"],
];

export default async function UsuariosPage() {
  await requireRole(["admin"]);
  return (
    <>
      <PageHeader
        title="Usuários e permissões"
        description="Papéis (roles) e escopo de acesso aplicados via RLS."
        action={<Button variant="gradient">Convidar usuário</Button>}
      />
      <DataTable columns={["E-mail", "Papel", "Escopo de acesso"]} rows={rows} />
    </>
  );
}
