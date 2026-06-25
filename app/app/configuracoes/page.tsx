import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guard";

export default async function ConfiguracoesPage() {
  await requireRole(["admin"]);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Preferências da organização e do portal." />
      <p className="mb-4 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        Estas preferências ainda não são persistidas (recurso planejado para uma próxima fase).
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="org">Nome da organização</Label>
            <Input id="org" defaultValue="NexisX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail de contato</Label>
            <Input id="email" type="email" defaultValue="contato@nexisx.com.br" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site">URL do portal</Label>
            <Input id="site" defaultValue="https://nexisx.com.br" />
          </div>
          <Button variant="gradient">Salvar alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
