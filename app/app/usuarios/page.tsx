import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { requireRole } from "@/lib/guard";
import { listProfiles } from "@/lib/db/queries";

const SCOPE: Record<Role, string> = {
  admin: "Tudo",
  responsavel: "Seus filhos",
  profissional: "Crianças vinculadas",
  escola: "Crianças autorizadas",
  consultor: "Solicitações comerciais",
};

const VARIANT: Record<Role, "default" | "secondary" | "accent" | "outline" | "warning"> = {
  admin: "default",
  responsavel: "secondary",
  profissional: "accent",
  escola: "outline",
  consultor: "warning",
};

export default async function UsuariosPage() {
  await requireRole(["admin"]);
  const profiles = await listProfiles();

  return (
    <>
      <PageHeader
        title="Usuários e permissões"
        description="Papéis (roles) e escopo de acesso aplicados via RLS."
        action={<Button variant="gradient">Convidar usuário</Button>}
      />
      {profiles.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Usuários cadastrados aparecerão aqui com seus papéis."
        />
      ) : (
        <DataTable
          columns={["Nome", "Papel", "Escopo de acesso"]}
          rows={profiles.map((p) => [
            p.full_name ?? "—",
            <Badge key={p.id} variant={VARIANT[p.role]}>{ROLE_LABELS[p.role]}</Badge>,
            SCOPE[p.role],
          ])}
        />
      )}
    </>
  );
}
