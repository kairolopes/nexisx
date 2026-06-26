import path from "node:path";
import { defineConfig } from "vitest/config";

// Testes unitários do NexisX. Ambiente Node (funções puras: scoring, validação,
// pipeline de IA mock). O alias `@/*` espelha o tsconfig do projeto.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd()),
    },
  },
});
