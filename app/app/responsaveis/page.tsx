import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";

const rows = [
  ["Ana Martins", "Mãe", "Helena Martins", "(00) 90000-0001"],
  ["Carlos Souza", "Pai", "Theo Souza", "(00) 90000-0002"],
  ["Júlia Rocha", "Mãe", "Lívia Rocha", "(00) 90000-0003"],
];

export default function ResponsaveisPage() {
  return (
    <>
      <PageHeader title="Responsáveis" description="Famílias cadastradas." action={<Button variant="gradient">Adicionar</Button>} />
      <DataTable columns={["Nome", "Vínculo", "Criança", "Contato"]} rows={rows} />
    </>
  );
}
