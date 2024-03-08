import { StringBuilder } from '@proficient/ds';

import type { Generator, PythonGeneratorConfig } from '../../interfaces';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import { divideModelsByType } from '../../util/divide-models-by-type';
import { multiply } from '../../util/multiply-str';
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

    builder.append(`${this.getImportStatements()}\n\n`);
    builder.append(`${this.getStaticDeclarations()}\n`);
    builder.append(`# Model Definitions\n\n`);

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
        const pyType = this.getPyTypeForValueType(model.value, 0);
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
        const pyType = this.getPyTypeForValueType(field.type, 0);
        builder.append(`${this.indent}${field.name}: ${pyType}\n`);
      });
    });

    return createGenerationOutput(builder.toString());
  }

  private getImportStatements() {
    const builder = new StringBuilder();
    builder.append(`from __future__ import annotations\n\n`);
    builder.append(`import typing\n`);
    builder.append(`import datetime\n`);
    builder.append(`import enum\n`);
    builder.append(`import pydantic`);
    return builder.toString();
  }

  private getStaticDeclarations() {
    const builder = new StringBuilder();
    builder.append(`class TypeSyncUndefined:\n`);
    builder.append(`${this.indent}_instance = None\n\n`);
    builder.append(`${this.indent}def __init__(self):\n`);
    builder.append(`${multiply(this.indent, 2)}if TypeSyncUndefined._instance is not None:\n`);
    builder.append(
      `${multiply(this.indent, 3)}raise RuntimeError("TypeSyncUndefined instances cannot be created directly. Use UNDEFINED instead.")\n`
    );
    builder.append(`${multiply(this.indent, 2)}else:\n`);
    builder.append(`${multiply(this.indent, 3)}TypeSyncUndefined._instance = self\n\n`);
    builder.append(`UNDEFINED = TypeSyncUndefined()\n`);
    return builder.toString();
  }

  private getPyTypeForValueType(type: schema.ValueType, depth: number) {
    if (schema.isPrimitiveValueType(type)) {
      return this.getPyTypeForPrimitiveValueType(type);
    }
    switch (type.type) {
      case 'literal':
        return this.getPyTypeForLiteralValueType(type);
      case 'enum':
        // TODO: Implement
        return 'typing.Any';
      case 'tuple':
        return this.getPyTypeForTupleValueType(type, depth);
      case 'list':
        return this.getPyTypeForListValueType(type, depth);
      case 'map':
        // TODO: Implement
        return 'typing.Any';
      case 'union':
        return this.getPyTypeForUnionValueType(type, depth);
      case 'alias':
        return type.name;
      default:
        assertNever(type);
    }
  }

  private getPyTypeForPrimitiveValueType(type: schema.PrimitiveValueType) {
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
      default:
        assertNever(type.type);
    }
  }

  private getPyTypeForLiteralValueType(type: schema.LiteralValueType) {
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

  private getPyTypeForTupleValueType(type: schema.TupleValueType, depth: number): string {
    const pyTypes = type.values.map(v => this.getPyTypeForValueType(v, depth)).join(', ');
    return `tuple[${pyTypes}]`;
  }

  private getPyTypeForListValueType(type: schema.ListValueType, depth: number): string {
    const pyType = this.getPyTypeForValueType(type.of, depth);
    return `typing.List[${pyType}]`;
  }

  private getPyTypeForUnionValueType(type: schema.UnionValueType, depth: number) {
    const pyTypes: string[] = type.members.map(memberValueType => {
      return this.getPyTypeForValueType(memberValueType, depth);
    });

    return `typing.Union[${pyTypes.join(', ')}]`;
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): Generator {
  return new PythonGeneratorImpl(config);
}
