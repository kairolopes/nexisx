// Interface única que todo provedor de IA implementa. A aplicação depende desta
// abstração — nunca de um SDK concreto (OpenAI, Anthropic, Gemini, etc.).
// Trocar de provedor não exige alterar a aplicação.

import type {
  AICallOptions,
  AICapability,
  BehavioralScreeningInput,
  BehavioralScreeningOutput,
  GeneticSummaryInput,
  GeneticSummaryOutput,
} from "./types";

export interface AIProvider {
  /** Identificador estável (ex.: "mock", "anthropic"). */
  readonly id: string;
  /** Modelo padrão usado por este provedor. */
  readonly model: string;

  /** Declara se o provedor atende a uma capacidade. */
  supports(capability: AICapability): boolean;

  /** Triagem comportamental digital (vídeo ou foto). Opcional por provedor. */
  behavioralScreening?(
    input: BehavioralScreeningInput,
    opts: AICallOptions,
  ): Promise<BehavioralScreeningOutput>;

  /** Resumo de laudo de DNA/Exoma a partir de texto já extraído. Opcional. */
  geneticSummary?(
    input: GeneticSummaryInput,
    opts: AICallOptions,
  ): Promise<GeneticSummaryOutput>;
}
