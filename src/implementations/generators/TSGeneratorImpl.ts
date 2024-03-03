import { StringBuilder } from '@proficient/ds';

import type { Generator, Schema, SchemaDocumentModel, SchemaModelField } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl implements Generator {
  public async generate(schema: Schema) {
    const { models } = schema;

    const builder = new StringBuilder();
    models.forEach(model => {
      if (model.type === 'alias') {
        // TODO: Implement
      } else {
        const tsType = this.getTSTypeForDocumentModel(model);
        if (model.docs !== undefined) {
          const tsDoc = this.buildTSDoc(model.docs);
          builder.append(`${tsDoc}\n`);
        }
        builder.append(`export interface ${model.name} ${tsType}\n`);
      }
    });

    return createGenerationOutput(builder.toString());
  }

  /**
   * Builds the TypeScript type for a given model as string.
   */
  private getTSTypeForDocumentModel(model: SchemaDocumentModel) {
    const { fields } = model;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      const tsType = this.getTSTypeForModelField(field);
      if (field.docs !== undefined) {
        // TODO: We probably need to compute indentation according to the current depth.
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
  private getTSTypeForModelField(modelField: SchemaModelField) {
    switch (modelField.type.type) {
      case 'string':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'int':
        return 'number';
      case 'enum':
        return modelField.type.items.map(({ value }) => `${value}`).join(' | ');
    }
  }
}

export function createTSGenerator(): Generator {
  return new TSGeneratorImpl();
}
