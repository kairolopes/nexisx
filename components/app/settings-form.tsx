"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { upsertSettings } from "@/lib/actions/settings";
import type { AppSettingRow } from "@/lib/db/types";

interface Props {
  settings: AppSettingRow[];
}

function val(settings: AppSettingRow[], key: string): string {
  return settings.find((s) => s.key === key)?.value ?? "";
}

export function SettingsForm({ settings }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertSettings(formData);
      if (result.ok) {
        toast.success("Configurações salvas com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao salvar configurações.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="org_name">Nome da organização</Label>
        <Input
          id="org_name"
          name="org_name"
          defaultValue={val(settings, "org_name")}
          placeholder="Ex.: NexisX"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="org_email">E-mail de contato</Label>
        <Input
          id="org_email"
          name="org_email"
          type="email"
          defaultValue={val(settings, "org_email")}
          placeholder="contato@exemplo.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="org_url">Site da organização</Label>
        <Input
          id="org_url"
          name="org_url"
          type="url"
          defaultValue={val(settings, "org_url")}
          placeholder="https://exemplo.com"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
