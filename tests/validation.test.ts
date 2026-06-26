import { describe, it, expect } from "vitest";
import {
  isUuid,
  isValidDate,
  requiredText,
  optionalText,
  requiredUuid,
  optionalUuid,
  optionalDate,
  intInRange,
  oneOf,
  ValidationError,
} from "@/lib/validation";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("isUuid", () => {
  it("aceita UUID válido e rejeita lixo", () => {
    expect(isUuid(UUID)).toBe(true);
    expect(isUuid("não-é-uuid")).toBe(false);
    expect(isUuid(123)).toBe(false);
  });
});

describe("requiredText", () => {
  it("normaliza (trim) e retorna o valor", () => {
    expect(requiredText("  oi  ", "campo")).toBe("oi");
  });
  it("lança ValidationError em vazio", () => {
    expect(() => requiredText("   ", "campo")).toThrow(ValidationError);
    expect(() => requiredText(null, "campo")).toThrow(ValidationError);
  });
  it("lança ao exceder o tamanho máximo", () => {
    expect(() => requiredText("abcdef", "campo", 3)).toThrow(ValidationError);
  });
});

describe("optionalText", () => {
  it('converte "" e null em null; corta no máximo', () => {
    expect(optionalText("")).toBeNull();
    expect(optionalText(null)).toBeNull();
    expect(optionalText("  x  ")).toBe("x");
    expect(optionalText("abcdef", 3)).toBe("abc");
  });
});

describe("requiredUuid / optionalUuid", () => {
  it("requiredUuid valida e lança", () => {
    expect(requiredUuid(UUID, "id")).toBe(UUID);
    expect(() => requiredUuid("x", "id")).toThrow(ValidationError);
  });
  it("optionalUuid aceita vazio como null", () => {
    expect(optionalUuid("", "id")).toBeNull();
    expect(optionalUuid(null, "id")).toBeNull();
    expect(() => optionalUuid("x", "id")).toThrow(ValidationError);
  });
});

describe("optionalDate / isValidDate", () => {
  it("valida datas reais", () => {
    expect(isValidDate("2020-03-10")).toBe(true);
    expect(isValidDate("data-ruim")).toBe(false);
    expect(optionalDate("", "d")).toBeNull();
    expect(optionalDate("2020-03-10", "d")).toBe("2020-03-10");
    expect(() => optionalDate("xx", "d")).toThrow(ValidationError);
  });
});

describe("intInRange", () => {
  it("aceita dentro da faixa e trunca", () => {
    expect(intInRange("5", "n", 1, 10)).toBe(5);
    expect(intInRange(5.9, "n", 1, 10)).toBe(5);
  });
  it("lança fora da faixa ou inválido", () => {
    expect(() => intInRange(0, "n", 1, 10)).toThrow(ValidationError);
    expect(() => intInRange(11, "n", 1, 10)).toThrow(ValidationError);
    expect(() => intInRange("abc", "n", 1, 10)).toThrow(ValidationError);
  });
});

describe("oneOf", () => {
  it("aceita valor permitido e rejeita o resto", () => {
    expect(oneOf("video", "tipo", ["video", "photo"] as const)).toBe("video");
    expect(() => oneOf("audio", "tipo", ["video", "photo"] as const)).toThrow(ValidationError);
  });
});
