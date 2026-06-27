// Geração do PDF do relatório de triagem a partir do modelo de apresentação.
// Usa pdf-lib (JS puro, sem dependências nativas) — roda no runtime Node de um
// route handler. NÃO acessa banco: recebe a view já montada (buildScreeningReportView).

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatDate } from "@/lib/utils";
import { SCREENING_DISCLAIMER, type ScreeningReportView } from "./screening";

const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4 retrato (pt)
const PAGE_HEIGHT = 841.89;
const INK = rgb(0.1, 0.12, 0.16);
const MUTED = rgb(0.4, 0.43, 0.48);
const ACCENT = rgb(0.05, 0.55, 0.73);

/** Quebra um texto em linhas que cabem na largura disponível. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildScreeningReportPdf(view: ScreeningReportView): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Relatório de triagem — ${view.childName}`);
  doc.setCreator("NexisX");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const contentWidth = PAGE_WIDTH - MARGIN * 2;
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN + 60) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawParagraph = (text: string, size: number, font_: PDFFont, color = INK, gap = 6) => {
    for (const line of wrapText(text, font_, size, contentWidth)) {
      ensureSpace(size + gap);
      page.drawText(line, { x: MARGIN, y, size, font: font_, color });
      y -= size + gap;
    }
  };

  const drawHeading = (text: string) => {
    y -= 10;
    ensureSpace(16);
    page.drawText(text, { x: MARGIN, y, size: 13, font: bold, color: ACCENT });
    y -= 18;
  };

  const drawField = (label: string, value: string) => {
    ensureSpace(14);
    page.drawText(`${label}: `, { x: MARGIN, y, size: 11, font: bold, color: INK });
    const labelWidth = bold.widthOfTextAtSize(`${label}: `, 11);
    const valueLines = wrapText(value, font, 11, contentWidth - labelWidth);
    valueLines.forEach((line, i) => {
      if (i === 0) {
        page.drawText(line, { x: MARGIN + labelWidth, y, size: 11, font, color: INK });
      } else {
        y -= 15;
        ensureSpace(14);
        page.drawText(line, { x: MARGIN + labelWidth, y, size: 11, font, color: INK });
      }
    });
    y -= 17;
  };

  // Cabeçalho
  page.drawText("NexisX", { x: MARGIN, y, size: 20, font: bold, color: ACCENT });
  y -= 22;
  page.drawText("Relatório preliminar de triagem", { x: MARGIN, y, size: 14, font: bold, color: INK });
  y -= 18;
  page.drawText(`Gerado em ${formatDate(view.generatedAt)}`, { x: MARGIN, y, size: 10, font, color: MUTED });
  y -= 14;

  // Identificação
  drawHeading("Identificação");
  drawField("Criança", view.childName);
  if (view.priorityLabel) drawField("Prioridade", view.priorityLabel);

  // M-CHAT
  if (view.mchat) {
    drawHeading("M-CHAT");
    if (view.mchat.score !== null) drawField("Pontuação", String(view.mchat.score));
    if (view.mchat.riskLabel) drawField("Nível de risco", view.mchat.riskLabel);
    if (view.mchat.completedAt) drawField("Concluído em", formatDate(view.mchat.completedAt));
  }

  // Análise facial
  if (view.facial) {
    drawHeading("Análise facial");
    drawField("Status", view.facial.status);
    if (view.facial.result) drawField("Resultado", view.facial.result);
    if (view.facial.observations) drawField("Observações", view.facial.observations);
  }

  // Conclusão
  if (view.recommendation || view.nextSteps) {
    drawHeading("Conclusão preliminar");
    if (view.recommendation) {
      page.drawText("Recomendação", { x: MARGIN, y, size: 11, font: bold, color: INK });
      y -= 16;
      drawParagraph(view.recommendation, 11, font);
    }
    if (view.nextSteps) {
      y -= 4;
      page.drawText("Próximos passos", { x: MARGIN, y, size: 11, font: bold, color: INK });
      y -= 16;
      drawParagraph(view.nextSteps, 11, font);
    }
  }

  // Aviso legal (rodapé de conteúdo)
  y -= 10;
  ensureSpace(60);
  page.drawText("Aviso importante", { x: MARGIN, y, size: 11, font: bold, color: rgb(0.7, 0.45, 0.05) });
  y -= 16;
  drawParagraph(SCREENING_DISCLAIMER, 9.5, font, MUTED, 5);

  return doc.save();
}
