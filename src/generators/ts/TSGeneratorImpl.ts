import { StringBuilder } from '@proficient/ds';

import { createGenerationOutput } from '../../components';
import type { Generator, TSGeneratorConfig } from '../../interfaces';
import { ts } from '../../platforms/ts';
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
    const { models } = s;

    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();

    builder.append(`${tsFirestoreImport}\n\n`);

    const { aliasModels, documentModels } = this.divideModelsByType(models);

    aliasModels.forEach(model => {
      const tsType = ts.schema.fromType(model.value);
      if (model.docs !== undefined) {
        const tsDoc = this.buildTSDoc(model.docs);
        builder.append(`${tsDoc}\n`);
      }
      builder.append(`export type ${model.name} = ${tsType.expression.content};\n\n`);
    });

    documentModels.forEach((model, modelIndex) => {
      // A Firestore document can be considered a 'map' type
      const tsType = ts.schema.fromMapType({ type: 'map', fields: model.fields });
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

  private divideModelsByType(models: schema.Model[]) {
    const aliasModels: schema.AliasModel[] = [];
    const documentModels: schema.DocumentModel[] = [];
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
