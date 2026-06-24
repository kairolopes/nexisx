import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";

const rows = [
  ["Escola Aurora", "São Paulo", "12 crianças", "contato@aurora.edu"],
  ["Colégio Horizonte", "Belo Horizonte", "8 crianças", "sec@horizonte.edu"],
];

export default function EscolasPage() {
  return (
    <>
      <PageHeader title="Escolas" description="Instituições parceiras." action={<Button variant="gradient">Adicionar</Button>} />
      <DataTable columns={["Escola", "Cidade", "Vínculos", "Contato"]} rows={rows} />
    </>
  );
}
