import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getSignedFileUrl, type BucketId } from "@/lib/storage";
import type { UploadedDocumentRow } from "@/lib/db/types";

/**
 * Lista documentos gerando URLs assinadas (temporárias) no servidor. As URLs nunca
 * são públicas: expiram e respeitam as policies de Storage.
 */
export async function DocumentsList({
  docs,
  bucket,
  emptyText = "Nenhum arquivo enviado ainda.",
}: {
  docs: UploadedDocumentRow[];
  bucket: BucketId;
  emptyText?: string;
}) {
  if (docs.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
          {emptyText}
        </CardContent>
      </Card>
    );
  }

  const withUrls = await Promise.all(
    docs.map(async (d) => ({ doc: d, url: await getSignedFileUrl(bucket, d.file_path) })),
  );

  return (
    <div className="space-y-3">
      {withUrls.map(({ doc, url }) => (
        <Card key={doc.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.file_path.split("/").pop()}</p>
              <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
            </div>
            <Badge variant="secondary">{doc.doc_type ?? "documento"}</Badge>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" /> Abrir
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">Indisponível</span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
