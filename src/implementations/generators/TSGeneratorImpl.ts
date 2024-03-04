import { StringBuilder } from '@proficient/ds';

import type {
  Generator,
  Schema,
  SchemaDocumentModel,
  SchemaAliasModel,
  SchemaModel,
  SchemaValueType,
  SchemaMapValueType,
  SchemaEnumValueType,
  TSGeneratorConfig,
  SchemaUnionValueType,
} from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';
import { assertNever } from '../../util/assert';

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

  public async generate(schema: Schema) {
    const { models } = schema;

    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = this.divideModelsByType(models);

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

  private divideModelsByType(models: SchemaModel[]) {
    const aliasModels: SchemaAliasModel[] = [];
    const documentModels: SchemaDocumentModel[] = [];
    models.forEach(model => {
      switch (model.type) {
        case 'alias':
          aliasModels.push(model);
          break;
        case 'document':
          documentModels.push(model);
          break;
        default:
          assertNever(model);
      }
    });
    return { aliasModels, documentModels };
  }

  private getTSTypeForAliasModel(model: SchemaAliasModel, depth: number) {
    return this.getTSTypeForSchemaValueType(model.value, depth);
  }

  private buildTSDoc(docs: string, depth: number) {
    const spaceCount = this.config.indentation * depth;
    const spaces = new Array<string>(spaceCount).fill(' ').join('');
    return `${spaces}/**\n${spaces} * ${docs}\n${spaces} */`;
  }

  private getTSTypeForSchemaValueType(type: SchemaValueType, depth: number) {
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
      case 'alias':
        return type.name;
      case 'enum':
        return this.getTSTypeForSchemaEnumValueType(type);
      case 'map':
        return this.getTSTypeForSchemaMapValueType(type, depth);
      case 'union':
        return this.getTSTypeForSchemaUnionValueType(type, depth);
      default:
        assertNever(type);
    }
  }

  private getTSTypeForSchemaEnumValueType(type: SchemaEnumValueType) {
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

  private getTSTypeForSchemaMapValueType(type: SchemaMapValueType, depth: number) {
    const { fields } = type;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      if (field.docs !== undefined) {
        const tsDoc = this.buildTSDoc(field.docs, depth + 1);
        builder.append(`${tsDoc}\n`);
      }

      builder.append('  ');

      const spaceCount = this.config.indentation * depth;
      const spaces = new Array<string>(spaceCount).fill(' ').join('');
      builder.append(spaces);

      const tsType = this.getTSTypeForSchemaValueType(field.type, depth + 1);
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${tsType};\n`);
    });

    const spaceCount = this.config.indentation * depth;
    const spaces = new Array<string>(spaceCount).fill(' ').join('');
    builder.append(spaces);
    builder.append(`}`);

    return builder.toString();
  }

  private getTSTypeForSchemaUnionValueType(type: SchemaUnionValueType, depth: number) {
    const tsTypes: string[] = type.members.map(memberValueType => {
      return this.getTSTypeForSchemaValueType(memberValueType, depth);
    });

    return tsTypes.join(' | ');
  }
}

export function createTSGenerator(config: TSGeneratorConfig): Generator {
  return new TSGeneratorImpl(config);
}
