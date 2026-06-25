import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timeline } from "@/components/app/timeline";
import { FileUploader } from "@/components/app/file-uploader";
import { DocumentsList } from "@/components/app/documents-list";
import { formatDate, initials } from "@/lib/utils";
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
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl">{initials(child.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="heading-md">{child.full_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{childAge(child.birth_date)}</p>
        </div>
      </div>

      <Tabs defaultValue="visao">
        <TabsList>
          <TabsTrigger value="visao">Visão geral</TabsTrigger>
          <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao">
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Diário recente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
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
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <Timeline events={events} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <div className="space-y-4">
            <FileUploader childOptions={[{ id: child.id, full_name: child.full_name }]} kind="document" />
            <DocumentsList docs={childDocs} bucket={BUCKETS.documents} />
          </div>
        </TabsContent>
      </Tabs>
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
