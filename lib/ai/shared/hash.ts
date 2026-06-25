// Hash de conteúdo — usado, entre outros, para o cache de resumos de DNA/Exoma:
// SHA256 do texto estruturado evita reenviar à IA conteúdo idêntico.

import { createHash } from "node:crypto";

export function sha256Hex(content: string | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}
