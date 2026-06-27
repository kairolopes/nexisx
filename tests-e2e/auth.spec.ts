import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Smoke test E2E — parte AUTENTICADA (login + área interna como admin).
 *
 * Funciona de duas formas (em ordem de preferência):
 *   1. storageState — capturado via `scripts/capture-session.ts` em
 *      `tests-e2e/.auth/session.json`. Nenhuma credencial necessária.
 *   2. Env vars — E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD (fallback para CI).
 *
 * Sem nenhuma das duas fontes os testes são PULADOS (skip) — não falham.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const SESSION_PATH = path.join(process.cwd(), "tests-e2e", ".auth", "session.json");

const hasSession = fs.existsSync(SESSION_PATH);
const hasCreds = Boolean(EMAIL && PASSWORD);
const canRun = hasSession || hasCreds;

// Seções internas que um admin deve conseguir abrir (sem ser redirecionado ao login).
const ADMIN_SECTIONS = [
  "/app/usuarios",
  "/app/responsaveis",
  "/app/profissionais",
  "/app/escolas",
  "/app/diagnostico",
];

test.describe("admin autenticado", () => {
  test.skip(!canRun, "Capture a sessão com `npx tsx scripts/capture-session.ts` ou defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD.");

  test.beforeEach(async ({ page }) => {
    if (hasSession) {
      // storageState já injetado pelo playwright.config.ts — contexto está autenticado.
      // Basta navegar para /app e confirmar que não redireciona ao login.
      await page.goto("/app");
      await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 15_000 });
    } else {
      // Fallback: login com credenciais via env vars.
      await page.goto("/login");
      await page.getByLabel("E-mail").fill(EMAIL!);
      await page.getByLabel("Senha").fill(PASSWORD!);
      await page.getByRole("button", { name: "Entrar" }).click();
      await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 15_000 });
    }
  });

  test("login leva ao dashboard", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app(\/|$)/);
    await expect(page).not.toHaveURL(/\/login/);
  });

  for (const section of ADMIN_SECTIONS) {
    test(`admin acessa ${section}`, async ({ page }) => {
      await page.goto(section);
      await expect(page).toHaveURL(new RegExp(section.replace(/\//g, "\\/")));
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});
