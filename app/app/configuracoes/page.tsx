import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/guard";
import { Settings2 } from "lucide-react";

export default async function ConfiguracoesPage() {
  await requireRole(["admin"]);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Preferências da organização e do portal." />
      <Card>
        <CardHeader>
          <CardTitle>Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
            <Settings2 className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Configurações em desenvolvimento</p>
            <p className="max-w-sm text-xs">
              A persistência de preferências da organização (nome, e-mail de contato, URL) está
              planejada para o Sprint 4. Esta tela será funcional em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
