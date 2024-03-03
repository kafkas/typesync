import { StringBuilder } from '@proficient/ds';

import type {
  Generator,
  Schema,
  SchemaDocumentModel,
  SchemaAliasModel,
  SchemaModel,
  SchemaValueType,
} from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl implements Generator {
  public async generate(schema: Schema) {
    const { models } = schema;

    const builder = new StringBuilder();
    const { aliasModels, documentModels } = this.divideModelsByType(models);

    aliasModels.forEach(model => {
      const tsType = this.getTSTypeForAliasModel(model);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType}\n`);
    });

    documentModels.forEach(model => {
      const tsType = this.getTSTypeForDocumentModel(model);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export interface ${model.name} ${tsType}\n`);
    });

    return createGenerationOutput(builder.toString());
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
   * Builds the TypeScript type for a given document model as string.
   */
  private getTSTypeForDocumentModel(model: SchemaDocumentModel) {
    const { fields } = model;
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
      case 'enum':
        return type.items.map(({ value }) => `${value}`).join(' | ');
    }
  }
}

export function createTSGenerator(): Generator {
  return new TSGeneratorImpl();
}
