import { StringBuilder } from '@proficient/ds';
import { divideModelsByType } from '../../util/divide-models-by-type';
import type { Generator, PythonGeneratorConfig, schema } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';
import { space } from '../../util/space';
import { assertNever } from '../../util/assert';

export class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  private get indent() {
    return space(this.config.indentation);
  }

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    builder.append(`import typing\n`);
    builder.append(`import pydantic\n\n`);

    const { documentModels } = divideModelsByType(models);

    documentModels.forEach(model => {
      // TODO: Add doc comment
      builder.append(`class ${model.name}(pydantic.BaseModel):\n`);
      model.fields.forEach(field => {
        const pyType = this.getPyTypeForSchemaValueType(field.type, 0);
        builder.append(`${this.indent}${field.name}: ${pyType}\n`);
      });
    });

    return createGenerationOutput(builder.toString());
  }

  private getPyTypeForSchemaValueType(type: schema.ValueType, depth: number) {
    switch (type.type) {
      case 'nil':
        return 'None';
      case 'string':
        return 'str';
      case 'boolean':
        return 'bool';
      case 'int':
        return 'int';
      case 'timestamp':
        // TODO: Implement
        return 'typing.Any';
      case 'literal':
        // TODO: Implement
        return 'typing.Any';
      case 'enum':
        // TODO: Implement
        return 'typing.Any';
      case 'map':
        // TODO: Implement
        return 'typing.Any';
      case 'union':
        return this.getPyTypeForSchemaUnionValueType(type, depth);
      case 'alias':
        // TODO: Implement
        return 'typing.Any';
      default:
        assertNever(type);
    }
  }

  private getPyTypeForSchemaUnionValueType(type: schema.UnionValueType, depth: number) {
    const pyTypes: string[] = type.members.map(memberValueType => {
      return this.getPyTypeForSchemaValueType(memberValueType, depth);
    });

    return `typing.Union[${pyTypes.join(', ')}]`;
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): Generator {
  return new PythonGeneratorImpl(config);
}
