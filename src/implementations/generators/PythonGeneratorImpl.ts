import { StringBuilder } from '@proficient/ds';

import type { Generator, PythonGeneratorConfig, schema } from '../../interfaces';
import { assertNever } from '../../util/assert';
import { divideModelsByType } from '../../util/divide-models-by-type';
import { space } from '../../util/space';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class PythonGeneratorImpl implements Generator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  private get indent() {
    return space(this.config.indentation);
  }

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    builder.append(`import typing\n`);
    builder.append(`import datetime\n`);
    builder.append(`import enum\n`);
    builder.append(`import pydantic\n\n`);

    const { aliasModels, documentModels } = divideModelsByType(models);

    aliasModels.forEach(model => {
      // TODO: Add doc comment
      if (
        model.value.type === 'nil' ||
        model.value.type === 'string' ||
        model.value.type === 'boolean' ||
        model.value.type === 'int' ||
        model.value.type === 'timestamp' ||
        model.value.type === 'alias'
      ) {
        const pyType = this.getPyTypeForSchemaValueType(model.value, 0);
        builder.append(`${model.name} = ${pyType}\n\n`);
      } else if (model.value.type === 'enum') {
        builder.append(`class ${model.name}(enum.Enum):\n`);
        model.value.items.forEach(item => {
          builder.append(
            `${this.indent}${item.label} = ${typeof item.value === 'string' ? `"${item.value}"` : item.value}\n`
          );
        });
        builder.append(`\n`);
      } else {
        // TODO: Implement
      }
    });

    builder.append('\n');

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
        return 'datetime.datetime';
      case 'literal':
        return this.getPyTypeForSchemaLiteralValueType(type);
      case 'enum':
        // TODO: Implement
        return 'typing.Any';
      case 'tuple':
        return this.getPyTypeForSchemaTupleValueType(type, depth);
      case 'list':
        return this.getPyTypeForSchemaListValueType(type, depth);
      case 'map':
        // TODO: Implement
        return 'typing.Any';
      case 'union':
        return this.getPyTypeForSchemaUnionValueType(type, depth);
      case 'alias':
        return type.name;
      default:
        assertNever(type);
    }
  }

  private getPyTypeForSchemaLiteralValueType(type: schema.LiteralValueType) {
    switch (typeof type.value) {
      case 'string':
        return `typing.Literal["${type.value}"]`;
      case 'number':
        // TODO: Don't allow float literals in the spec
        return `typing.Literal[${type.value}]`;
      case 'boolean':
        return `typing.Literal[${type.value ? 'True' : 'False'}]`;
      default:
        assertNever(type.value);
    }
  }

  private getPyTypeForSchemaTupleValueType(type: schema.TupleValueType, depth: number): string {
    const pyTypes = type.values.map(v => this.getPyTypeForSchemaValueType(v, depth)).join(', ');
    return `tuple[${pyTypes}]`;
  }

  private getPyTypeForSchemaListValueType(type: schema.ListValueType, depth: number): string {
    const pyType = this.getPyTypeForSchemaValueType(type.of, depth);
    return `typing.List[${pyType}]`;
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
