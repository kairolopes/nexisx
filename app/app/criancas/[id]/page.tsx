import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/app/timeline";
import { FileUploader } from "@/components/app/file-uploader";
import { DocumentsList } from "@/components/app/documents-list";
import { formatDate } from "@/lib/utils";
import { childAge } from "@/lib/age";
import { BUCKETS } from "@/lib/storage";
import {
  getChild,
  listTimelineEvents,
  listTasks,
  listDiaryEntries,
  listScreeningReports,
  listDocuments,
} from "@/lib/db/queries";

export default async function ChildProfilePage({ params }: { params: { id: string } }) {
  const child = await getChild(params.id);
  if (!child) notFound();

  const [events, tasks, diary, reports, docs] = await Promise.all([
    listTimelineEvents(child.id),
    listTasks(child.id),
    listDiaryEntries(child.id),
    listScreeningReports(child.id),
    listDocuments(child.id),
  ]);

  const concluidas = tasks.filter((t) => t.status === "concluida").length;
  // Documentos gerais (laudos genéticos ficam na tela de Laudos, em outro bucket).
  const childDocs = docs.filter((d) => d.doc_type !== "laudo_genetico");

  return (
    <>
      <Link
        href="/app/criancas"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <PageHeader title={child.full_name} description="Perfil completo e histórico." />

      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard
          title="Dados pessoais"
          rows={[
            ["Idade", childAge(child.birth_date)],
            ["Nascimento", child.birth_date ? formatDate(child.birth_date) : "—"],
            ["Cadastrado em", formatDate(child.created_at)],
          ]}
        />
        <DetailCard
          title="Acompanhamento"
          rows={[
            ["Tarefas", String(tasks.length)],
            ["Concluídas", String(concluidas)],
            ["Relatórios", String(reports.length)],
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{child.notes ?? "Sem observações."}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Diário recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diary.length === 0 ? (
              <Empty text="Sem registros no diário." />
            ) : (
              diary.slice(0, 4).map((d) => (
                <div key={d.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{d.mood ?? "registro"}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
                  </div>
                  {d.notes && <p className="mt-2 text-sm text-muted-foreground">{d.notes}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline events={events} />
          </CardContent>
        </Card>
      </div>

      <section className="mt-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">Documentos</h2>
        <FileUploader childOptions={[{ id: child.id, full_name: child.full_name }]} kind="document" />
        <DocumentsList docs={childDocs} bucket={BUCKETS.documents} />
      </section>
    </>
  );
}

function DetailCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
