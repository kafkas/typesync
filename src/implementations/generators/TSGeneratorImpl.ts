import type { Generator, Schema } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl {
  public async generate(schema: Schema) {
    // TODO: Implement
    return createGenerationOutput();
  }
}

export function createTSGenerator(): Generator {
  return new TSGeneratorImpl();
}
