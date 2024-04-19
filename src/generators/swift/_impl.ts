import { schema } from '../../schema/index.js';
import type { SwiftDeclaration, SwiftGeneration, SwiftGenerator, SwiftGeneratorConfig } from './_types.js';

class SwiftGeneratorImpl implements SwiftGenerator {
  public constructor(private readonly config: SwiftGeneratorConfig) {}

  public generate(s: schema.Schema): SwiftGeneration {
    const declarations: SwiftDeclaration[] = [];

    return { type: 'swift', declarations };
  }
}

export function createSwiftGenerator(config: SwiftGeneratorConfig): SwiftGenerator {
  return new SwiftGeneratorImpl(config);
}
