import { StringBuilder } from '@proficient/ds';

import { generation } from '../generation';
import { TSGeneration } from '../generation/_types';
import { assertNever } from '../util/assert';
import type { RenderedFile, TSRenderer, TSRendererConfig } from './_types';

class TSRendererImpl implements TSRenderer {
  public constructor(private readonly config: TSRendererConfig) {}

  public render(g: TSGeneration): RenderedFile[] {
    const builder = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();
    builder.append(`${tsFirestoreImport}\n\n`);

    g.declarations.forEach(declaration => {
      builder.append(`${this.renderDeclaration(declaration)};\n\n`);
    });

    return [{ relativePath: this.config.rootFileName, content: builder.toString() }];
  }

  private renderDeclaration(declaration: generation.TSDeclaration) {
    switch (declaration.type) {
      case 'alias': {
        const { modelName, modelType } = declaration;
        return `export type ${modelName} = ${modelType.expression.content};`;
      }
      case 'interface': {
        const { modelName, modelType } = declaration;
        return `export interface ${modelName} ${modelType.expression.content}`;
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

export function create(config: TSRendererConfig) {
  return new TSRendererImpl(config);
}
