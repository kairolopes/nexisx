// Download do relatório de triagem em PDF.
// Protegido pelo middleware (/app/*) + RLS na leitura (loadScreeningReportView).
// Runtime Node (pdf-lib não roda no edge).

import { getSessionProfile } from "@/lib/auth";
import { loadScreeningReportView } from "@/lib/reports/screening-data";
import { buildScreeningReportPdf } from "@/lib/reports/screening-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(name: string): string {
  // NFD separa acentos em marcas combinantes; [^a-zA-Z0-9] já as remove e mantém a letra base.
  return (
    name
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "triagem"
  );
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSessionProfile();
  if (!session) {
    return new Response("Não autenticado.", { status: 401 });
  }

  const view = await loadScreeningReportView(params.id);
  if (!view) {
    return new Response("Relatório não encontrado.", { status: 404 });
  }

  const pdf = await buildScreeningReportPdf(view);
  const filename = `relatorio-triagem-${slugify(view.childName)}.pdf`;

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
