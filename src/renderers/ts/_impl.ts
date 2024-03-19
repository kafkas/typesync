import { StringBuilder } from '@proficient/ds';

import type { TSDeclaration, TSGeneration } from '../../generators/ts';
import { ts } from '../../platforms/ts';
import { assertNever } from '../../util/assert';
import type { RenderedFile } from '../_types';
import type { TSRenderer, TSRendererConfig } from './_types';

class TSRendererImpl implements TSRenderer {
  public constructor(private readonly config: TSRendererConfig) {}

  public render(g: TSGeneration): RenderedFile[] {
    const b = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();
    b.append(`${tsFirestoreImport}\n\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)};\n\n`);
    });

    const renderedFile: RenderedFile = {
      relativePath: this.config.rootFileName,
      content: b.toString(),
    };

    return [renderedFile];
  }

  private renderDeclaration(declaration: TSDeclaration) {
    switch (declaration.type) {
      case 'alias': {
        const { modelName, modelType } = declaration;
        const expression = ts.expressionForType(modelType);
        return `export type ${modelName} = ${expression.content};`;
      }
      case 'interface': {
        const { modelName, modelType } = declaration;
        const expression = ts.expressionForType(modelType);
        return `export interface ${modelName} ${expression.content}`;
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

export function createTSRenderer(config: TSRendererConfig): TSRenderer {
  return new TSRendererImpl(config);
}
