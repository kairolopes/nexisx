import { describe, it, expect } from "vitest";
import { childAge } from "@/lib/age";

describe("childAge", () => {
  it("trata data ausente ou inválida", () => {
    expect(childAge(null)).toBe("Idade não informada");
    expect(childAge("data-ruim")).toBe("Idade não informada");
  });

  it("formata bebê (apenas meses) para data recente", () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    const iso = d.toISOString().slice(0, 10);
    expect(childAge(iso)).toMatch(/^\d+m$/);
  });

  it("formata anos exatos sem meses", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    const iso = d.toISOString().slice(0, 10);
    expect(childAge(iso)).toMatch(/^3a( \d+m)?$/);
  });

  it("nunca retorna idade negativa para data futura", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const iso = d.toISOString().slice(0, 10);
    // Data futura → meses clampados a 0 → "0m".
    expect(childAge(iso)).toBe("0m");
  });
});
