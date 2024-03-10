import type { GenerationOutput } from '../interfaces';

class GenerationOutputImpl implements GenerationOutput {
  public constructor(private readonly content: string) {}

  public toString() {
    return this.content;
  }
}

export function createGenerationOutput(content: string): GenerationOutputImpl {
  return new GenerationOutputImpl(content);
}
