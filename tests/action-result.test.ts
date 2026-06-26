import { describe, it, expect } from "vitest";
import { ok, fail, ValidationError } from "@/lib/validation";
import { runAction } from "@/lib/actions/helpers";
import { AuthzError } from "@/lib/guard";

describe("ActionResult helpers", () => {
  it("ok/fail produzem a união discriminada esperada", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
    expect(fail("erro")).toEqual({ ok: false, error: "erro" });
  });
});

describe("runAction", () => {
  it("envelopa sucesso em { ok: true, data }", async () => {
    const r = await runAction(async () => ({ id: "x" }));
    expect(r).toEqual({ ok: true, data: { id: "x" } });
  });

  it("converte ValidationError em falha com a mensagem original", async () => {
    const r = await runAction(async () => {
      throw new ValidationError("campo inválido");
    });
    expect(r).toEqual({ ok: false, error: "campo inválido" });
  });

  it("converte AuthzError em falha com a mensagem original", async () => {
    const r = await runAction(async () => {
      throw new AuthzError("sem permissão");
    });
    expect(r).toEqual({ ok: false, error: "sem permissão" });
  });

  it("mascara erros inesperados (não vaza a mensagem crua)", async () => {
    const r = await runAction(async () => {
      throw new Error("stack interno sensível");
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).not.toContain("stack interno");
      expect(r.error).toMatch(/tente novamente/i);
    }
  });
});
