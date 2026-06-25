// OCR DESACOPLADO — PDF nunca vai direto à IA. Contrato trocável (igual ao padrão
// de providers): trocar o motor de OCR não afeta a camada de IA nem os prompts.
// ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../core/errors";

export interface OcrResult {
  /** Texto estruturado extraído do laudo (entrada do parser e do hash de cache). */
  text: string;
  /** Confiança da extração, quando o motor de OCR fornecer (0..1). */
  confidence?: number;
}

export interface OcrEngine {
  extractText(pdfBytes: Uint8Array): Promise<OcrResult>;
}

export function extractTextFromPdf(_pdfBytes: Uint8Array): Promise<OcrResult> {
  throw new AINotImplementedError("genetics/ocr.extractTextFromPdf");
}
