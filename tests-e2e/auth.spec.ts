import { test, expect } from "@playwright/test";

/**
 * Smoke test E2E — parte AUTENTICADA (login + área interna como admin).
 *
 * Requer credenciais de um usuário admin REAL no Supabase configurado, lidas de:
 *   E2E_ADMIN_EMAIL
 *   E2E_ADMIN_PASSWORD
 *
 * Sem elas os testes são PULADOS (skip) — não falham — porque:
 *  - o login depende do Supabase Auth (senha não pode ser fabricada pelo CI/IA);
 *  - não criamos usuários fictícios.
 *
 * Para rodar a parte autenticada:
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const hasCreds = Boolean(EMAIL && PASSWORD);

// Seções internas que um admin deve conseguir abrir (sem ser redirecionado ao login).
const ADMIN_SECTIONS = [
  "/app/usuarios",
  "/app/responsaveis",
  "/app/profissionais",
  "/app/escolas",
  "/app/diagnostico",
];

test.describe("admin autenticado", () => {
  test.skip(!hasCreds, "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para rodar o fluxo autenticado.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(EMAIL!);
    await page.getByLabel("Senha").fill(PASSWORD!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 15_000 });
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
