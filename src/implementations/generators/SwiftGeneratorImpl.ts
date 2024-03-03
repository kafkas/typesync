import type { Generator, Schema } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

class SwiftGeneratorImpl implements Generator {
  public async generate(schema: Schema) {
    // TODO: Implement
    const content = 'abc';
    return createGenerationOutput(content);
  }
}

export function createSwiftGenerator(): Generator {
  return new SwiftGeneratorImpl();
}
