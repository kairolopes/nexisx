import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/site/notice";

const sections = [
  { title: "Dados da criança", rows: [["Nome", "Helena Martins"], ["Idade", "2 anos e 8 meses"], ["Escola", "Escola Aurora"]] },
  { title: "Dados do responsável", rows: [["Nome", "Ana Martins"], ["Vínculo", "Mãe"], ["Contato", "(00) 90000-0000"]] },
  { title: "Análise facial", rows: [["Status", "Concluída"], ["Sinais", "Atenção moderada"]] },
  { title: "M-CHAT", rows: [["Pontuação", "5 / 20"], ["Classificação", "Risco moderado"]] },
];

export default function RelatorioTriagemPage() {
  return (
    <>
      <PageHeader
        title="Relatório de triagem"
        description="Documento preliminar consolidando análise facial e M-CHAT."
        action={<Button variant="gradient">Exportar PDF</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {s.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Conclusão e próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Nível de prioridade:</span>
            <Badge variant="warning">Moderado</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Recomenda-se avaliação com neuropediatra e psicólogo especializado. Considerar
            investigação genética (exoma) caso haja achados clínicos adicionais.
          </p>
          <Notice>
            Este relatório é preliminar e não substitui avaliação de profissionais habilitados.
          </Notice>
        </CardContent>
      </Card>
    </>
  );
}
