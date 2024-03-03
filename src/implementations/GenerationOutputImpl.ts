import type { GenerationOutput } from '../interfaces';

class GenerationOutputImpl implements GenerationOutput {
  public toString() {
    // TODO: Implement
    return '';
  }
}

export function createGenerationOutput(): GenerationOutputImpl {
  return new GenerationOutputImpl();
}
