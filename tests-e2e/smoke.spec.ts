import { test, expect } from "@playwright/test";

/**
 * Smoke test E2E — parte SEM autenticação.
 * Valida que o site público carrega e que toda rota protegida redireciona para
 * /login quando não há sessão (defesa de rota — middleware + requireRole).
 * Não exige credenciais nem banco populado.
 */

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/sobre",
  "/salas-sensoriais",
  "/dna",
  "/familias",
  "/profissionais",
  "/escolas-clinicas",
  "/contato",
];

// Rotas internas que devem exigir sessão (incluindo as pedidas na homologação).
const PROTECTED_ROUTES = [
  "/app",
  "/app/usuarios",
  "/app/responsaveis",
  "/app/profissionais",
  "/app/escolas",
  "/app/diagnostico",
];

test.describe("público", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`carrega rota pública ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `status de ${route}`).toBeLessThan(400);
    });
  }

  test("a tela de login tem campos de e-mail, senha e botão Entrar", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});

test.describe("proteção de rota (sem sessão)", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redireciona para /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});
