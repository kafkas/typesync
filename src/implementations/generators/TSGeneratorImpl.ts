import { StringBuilder } from '@proficient/ds';

import type { Generator, Schema, SchemaModel, SchemaModelField } from '../../interfaces';
import { createGenerationOutput } from '../GenerationOutputImpl';

export class TSGeneratorImpl implements Generator {
  public async generate(schema: Schema) {
    const { models } = schema;

    const builder = new StringBuilder();
    models.forEach(model => {
      const tsType = this.getTSTypeForModel(model);
      builder.append(`export interface ${model.name} ${tsType}\n`);
    });

    return createGenerationOutput(builder.toString());
  }

  /**
   * Builds the TypeScript type for a given model as string.
   */
  private getTSTypeForModel(model: SchemaModel) {
    const { fields } = model;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      const tsType = this.getTSTypeForModelField(field);
      builder.append('  ');
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${tsType};\n`);
    });
    builder.append(`}`);

    return builder.toString();
  }

  /**
   * Returns the TypeScript type for a given model as string.
   */
  private getTSTypeForModelField(modelField: SchemaModelField) {
    switch (modelField.type) {
      case 'string':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'int':
        return 'number';
    }
  }
}

export function createTSGenerator(): Generator {
  return new TSGeneratorImpl();
}
