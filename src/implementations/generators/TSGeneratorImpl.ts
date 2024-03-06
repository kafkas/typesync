import { StringBuilder } from '@proficient/ds';

import type { Generator, TSGeneratorConfig, schema } from '../../interfaces';
import { assertNever } from '../../util/assert';
import { divideModelsByType } from '../../util/divide-models-by-type';
import { space } from '../../util/space';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl implements Generator {
  private get firestore() {
    switch (this.config.platform) {
      case 'ts:firebase-admin:11':
        return 'firestore';
      default:
        assertNever(this.config.platform);
    }
  }

  public constructor(private readonly config: TSGeneratorConfig) {}

  public async generate(s: schema.Schema) {
    const { models } = s;

    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = divideModelsByType(models);

    aliasModels.forEach(model => {
      const tsType = this.getTSTypeForAliasModel(model, 0);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs, 0);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType};\n`);
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered a 'map' type
      const tsType = this.getTSTypeForSchemaMapValueType({ type: 'map', fields: model.fields }, 0);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs, 0);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export interface ${model.name} ${tsType}\n`);
    });

    return createGenerationOutput(builder.toString());
  }

  private getImportFirestoreStatement() {
    switch (this.config.platform) {
      case 'ts:firebase-admin:11':
        return `import { firestore } from 'firebase-admin';`;
      default:
        assertNever(this.config.platform);
    }
  }

  private getTSTypeForAliasModel(model: schema.AliasModel, depth: number) {
    return this.getTSTypeForSchemaValueType(model.value, depth);
  }

  private getTSTypeForSchemaValueType(type: schema.ValueType, depth: number) {
    switch (type.type) {
      case 'nil':
        return 'null';
      case 'string':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'int':
        return 'number';
      case 'timestamp':
        return `${this.firestore}.Timestamp`;
      case 'literal':
        return this.getTSTypeForSchemaLiteralValueType(type);
      case 'enum':
        return this.getTSTypeForSchemaEnumValueType(type);
      case 'map':
        return this.getTSTypeForSchemaMapValueType(type, depth);
      case 'union':
        return this.getTSTypeForSchemaUnionValueType(type, depth);
      case 'alias':
        return type.name;
      default:
        assertNever(type);
    }
  }

  private getTSTypeForSchemaLiteralValueType(type: schema.LiteralValueType) {
    switch (typeof type.value) {
      case 'string':
        return `'${type.value}'`;
      case 'number':
        return `${type.value}`;
      case 'boolean':
        return `${type.value}`;
      default:
        assertNever(type.value);
    }
  }

  private getTSTypeForSchemaEnumValueType(type: schema.EnumValueType) {
    const { items } = type;
    return items
      .map(({ value }) => {
        switch (typeof value) {
          case 'string':
            return `'${value}'`;
          case 'number':
            return `${value}`;
          default:
            assertNever(value);
        }
      })
      .join(' | ');
  }

  private getTSTypeForSchemaMapValueType(type: schema.MapValueType, depth: number) {
    const { fields } = type;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      if (field.docs !== undefined) {
        const tsDoc = this.buildTSDoc(field.docs, depth + 1);
        builder.append(`${tsDoc}\n`);
      }

      builder.append('  ');

      const spaces = space(this.config.indentation * depth);
      builder.append(spaces);

      const tsType = this.getTSTypeForSchemaValueType(field.type, depth + 1);
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${tsType};\n`);
    });

    const spaces = space(this.config.indentation * depth);
    builder.append(spaces);
    builder.append(`}`);

    return builder.toString();
  }

  private getTSTypeForSchemaUnionValueType(type: schema.UnionValueType, depth: number) {
    const tsTypes: string[] = type.members.map(memberValueType => {
      return this.getTSTypeForSchemaValueType(memberValueType, depth);
    });

    return tsTypes.join(' | ');
  }

  private buildTSDoc(docs: string, depth: number) {
    const spaces = space(this.config.indentation * depth);
    return `${spaces}/**\n${spaces} * ${docs}\n${spaces} */`;
  }
}

export function createTSGenerator(config: TSGeneratorConfig): Generator {
  return new TSGeneratorImpl(config);
}
