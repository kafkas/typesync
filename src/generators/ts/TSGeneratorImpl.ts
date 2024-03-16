import { StringBuilder } from '@proficient/ds';

import { createGenerationOutput } from '../../components';
import { converters } from '../../converters';
import type { Generator, TSGeneratorConfig } from '../../interfaces';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

class TSGeneratorImpl implements Generator {
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
    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = s;

    aliasModels.forEach(model => {
      const tsType = converters.schema.typeToTS(model.value);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType.expression.content};\n\n`);
    });

    documentModels.forEach((model, modelIndex) => {
      // A Firestore document can be considered an 'object' type
      const tsType = converters.schema.objectTypeToTS({ type: 'object', fields: model.fields });
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export interface ${model.name} ${tsType.expression.content}\n`);
      if (modelIndex < documentModels.length - 1) {
        builder.append('\n');
      }
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

  private buildTSDoc(docs: string) {
    return `/**\n * ${docs}\n */`;
  }
}

export function createTSGenerator(config: TSGeneratorConfig): Generator {
  return new TSGeneratorImpl(config);
}
