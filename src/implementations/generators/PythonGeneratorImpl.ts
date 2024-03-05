import { StringBuilder } from '@proficient/ds';
import { divideModelsByType } from '../../util/divide-models-by-type';
import type { Generator, PythonGeneratorConfig, schema } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    const { aliasModels, documentModels } = divideModelsByType(models);

    return createGenerationOutput(builder.toString());
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): Generator {
  return new PythonGeneratorImpl(config);
}
