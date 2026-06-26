import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do smoke test E2E (Playwright).
 *
 * Objetivo: homologação automatizada mínima — NÃO é suíte de regressão completa.
 * - `baseURL` aponta para o dev server local (porta fixa 3100).
 * - `webServer` sobe `next dev -p 3100` automaticamente, mas REUSA um servidor já
 *   em execução (`reuseExistingServer`), então rodar `npm run dev` antes é opcional.
 * - Os testes que exigem sessão real (login/área interna) leem credenciais de
 *   `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` e são PULADOS se ausentes (ver auth.spec.ts).
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests-e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 60_000,
  // Smoke determinístico: 1 worker evita "thundering herd" na 1ª compilação do
  // `next dev` (cold start), que de outra forma estoura timeouts de forma intermitente.
  workers: 1,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
