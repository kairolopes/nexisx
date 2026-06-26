import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/guard";
import { getAppSettings } from "@/lib/db/queries";
import { SettingsForm } from "@/components/app/settings-form";

export default async function ConfiguracoesPage() {
  await requireRole(["admin"]);
  const settings = await getAppSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Preferências da organização e do portal." />
      <Card>
        <CardHeader>
          <CardTitle>Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
