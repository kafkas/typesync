import { StringBuilder } from '@proficient/ds';

import type {
  Generator,
  Schema,
  SchemaDocumentModel,
  SchemaAliasModel,
  SchemaModel,
  SchemaValueType,
  TSGenerationPlatform,
  SchemaMapValueType,
  SchemaEnumValueType,
} from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl implements Generator {
  private get firestore() {
    switch (this.platform) {
      case 'ts:firebase-admin:11':
        return 'firestore';
    }
  }

  public constructor(private readonly platform: TSGenerationPlatform) {}

  public async generate(schema: Schema) {
    const { models } = schema;

    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = this.divideModelsByType(models);

    aliasModels.forEach(model => {
      const tsType = this.getTSTypeForAliasModel(model);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType};\n`);
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered a 'map' type
      const tsType = this.getTSTypeForSchemaMapValueType({ type: 'map', fields: model.fields });
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export interface ${model.name} ${tsType}\n`);
    });

    return createGenerationOutput(builder.toString());
  }

  private getImportFirestoreStatement() {
    switch (this.platform) {
      case 'ts:firebase-admin:11':
        return `import { firestore } from 'firebase-admin';`;
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
        // TODO: Handle default case properly
      }
    });
    return { aliasModels, documentModels };
  }

  /**
   * Builds the TypeScript type for a given alias model as string.
   */
  private getTSTypeForAliasModel(model: SchemaAliasModel) {
    return this.getTSTypeForSchemaValueType(model.value);
  }

  /**
   * Builds the TypeScript type for a given model as string.
   */
  private buildTSDoc(docs: string, indentation = 0) {
    const spaces = new Array<string>(indentation).fill(' ').join('');
    return `${spaces}/**\n${spaces} * ${docs}\n${spaces} */`;
  }

  /**
   * Returns the TypeScript type for a given model as string.
   */
  private getTSTypeForSchemaValueType(type: SchemaValueType) {
    switch (type.type) {
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
        return this.getTSTypeForSchemaMapValueType(type);
    }
  }

  /**
   * Builds the TypeScript type for a given document model as string.
   */
  private getTSTypeForSchemaEnumValueType(type: SchemaEnumValueType) {
    const { items } = type;
    return items.map(({ value }) => (typeof value === 'string' ? `'${value}'` : `${value}`)).join(' | ');
  }

  /**
   * Builds the TypeScript type for a given document model as string.
   */
  private getTSTypeForSchemaMapValueType(type: SchemaMapValueType) {
    const { fields } = type;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      const tsType = this.getTSTypeForSchemaValueType(field.type);
      if (field.docs !== undefined) {
        // TODO: We probably need to compute indentation according to current depth
        const tsDoc = this.buildTSDoc(field.docs, 2);
        builder.append(`${tsDoc}\n`);
      }
      builder.append('  ');
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${tsType};\n`);
    });
    builder.append(`}`);

    return builder.toString();
  }
}

export function createTSGenerator(platform: TSGenerationPlatform): Generator {
  return new TSGeneratorImpl(platform);
}
