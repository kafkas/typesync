import { StringBuilder } from '@proficient/ds';
import { divideModelsByType } from '../../util/divide-models-by-type';
import type { Generator, PythonGeneratorConfig, schema } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';
import { getSpaces } from '../../util/get-spaces';
import { assertNever } from '../../util/assert';

export class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  private get indent() {
    return getSpaces(this.config.indentation);
  }

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    builder.append(`from pydantic import BaseModel\n`);
    builder.append(`from typing import Any\n\n`);

    const { documentModels } = divideModelsByType(models);

    documentModels.forEach(model => {
      // TODO: Add doc comment
      builder.append(`class ${model.name}(BaseModel):\n`);
      model.fields.forEach(field => {
        const pyType = this.getTSTypeForSchemaValueType(field.type, 0);
        builder.append(`${this.indent}${field.name}: ${pyType}\n`);
      });
    });

    return createGenerationOutput(builder.toString());
  }

  private getTSTypeForSchemaValueType(type: schema.ValueType, depth: number) {
    switch (type.type) {
      case 'nil':
        // TODO: Implement
        return 'Any';
      case 'string':
        return 'str';
      case 'boolean':
        return 'bool';
      case 'int':
        return 'int';
      case 'timestamp':
        // TODO: Implement
        return 'Any';
      case 'literal':
        // TODO: Implement
        return 'Any';
      case 'enum':
        // TODO: Implement
        return 'Any';
      case 'map':
        // TODO: Implement
        return 'Any';
      case 'union':
        // TODO: Implement
        return 'Any';
      case 'alias':
        // TODO: Implement
        return 'Any';
      default:
        assertNever(type);
    }
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): Generator {
  return new PythonGeneratorImpl(config);
}
