import { StringBuilder } from '@proficient/ds';

import type { TSDeclaration, TSGeneration } from '../../generators/ts';
import { ts } from '../../platforms/ts';
import { assertNever } from '../../util/assert';
import type { RenderedFile } from '../_types';
import type { TSRenderer, TSRendererConfig } from './_types';

class TSRendererImpl implements TSRenderer {
  public constructor(private readonly config: TSRendererConfig) {}

  public render(g: TSGeneration): RenderedFile[] {
    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();
    builder.append(`${tsFirestoreImport}\n\n`);

    g.declarations.forEach(declaration => {
      builder.append(`${this.renderDeclaration(declaration)};\n\n`);
    });

    const renderedFile: RenderedFile = {
      relativePath: this.config.rootFileName,
      content: builder.toString(),
    };

    return [renderedFile];
  }

  private renderDeclaration(declaration: TSDeclaration) {
    switch (declaration.type) {
      case 'alias': {
        const { modelName, modelType } = declaration;
        return `export type ${modelName} = ${ts.expressionForType(modelType)};`;
      }
      case 'interface': {
        const { modelName, modelType } = declaration;
        return `export interface ${modelName} ${ts.expressionForType(modelType)}`;
      }
      default:
        assertNever(declaration);
    }
  }

  private getImportFirestoreStatement() {
    switch (this.config.platform) {
      case 'ts:firebase-admin:11':
        return `import { firestore } from 'firebase-admin';`;
      default:
        assertNever(this.config.platform);
    }
  }
}

export function createTSRenderer(config: TSRendererConfig) {
  return new TSRendererImpl(config);
}
