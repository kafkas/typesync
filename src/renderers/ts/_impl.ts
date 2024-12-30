import { StringBuilder } from '@proficient/ds';
import { format } from 'prettier';

import type { TSDeclaration, TSGeneration } from '../../generators/ts/index.js';
import { ts } from '../../platforms/ts/index.js';
import { assertNever } from '../../util/assert.js';
import type { RenderedFile } from '../_types.js';
import type { TSRenderer, TSRendererConfig } from './_types.js';

class TSRendererImpl implements TSRenderer {
  public constructor(private readonly config: TSRendererConfig) {}

  public async render(g: TSGeneration): Promise<RenderedFile> {
    const b = new StringBuilder();

    const tsFirestoreImport = this.getImportFirestoreStatement();
    b.append(`${tsFirestoreImport}\n\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)};\n\n`);
    });

    const content = b.toString();
    const formattedContent = await format(content, {
      parser: 'typescript',
      tabWidth: this.config.indentation,
      trailingComma: 'es5',
      printWidth: 120,
      singleQuote: true,
    });

    const rootFile: RenderedFile = {
      content: formattedContent,
    };

    return rootFile;
  }

  private renderDeclaration(declaration: TSDeclaration) {
    let output = '';
    switch (declaration.type) {
      case 'alias': {
        const { modelName, modelType, modelDocs } = declaration;
        const expression = ts.expressionForType(modelType);
        if (modelDocs !== null) {
          output += `/** ${modelDocs} */\n`;
        }
        output += `export type ${modelName} = ${expression.content};`;
        return output;
      }
      case 'interface': {
        const { modelName, modelType, modelDocs } = declaration;
        const expression = ts.expressionForType(modelType);
        if (modelDocs !== null) {
          output += `/** ${modelDocs} */\n`;
        }
        output += `export interface ${modelName} ${expression.content}`;
        return output;
      }
      default:
        assertNever(declaration);
    }
  }

  private getImportFirestoreStatement() {
    switch (this.config.target) {
      case 'firebase-admin@12':
        return `import type * as firestore from "firebase-admin/firestore"`;
      case 'firebase-admin@11':
        return `import type { firestore } from 'firebase-admin';`;
      case 'firebase@10':
      case 'firebase@9':
        return `import type * as firestore from 'firebase/firestore';`;
      case 'react-native-firebase@21':
        return `import type * as firestore from '@react-native-firebase/firestore';`;
      default:
        assertNever(this.config.target);
    }
  }
}

export function createTSRenderer(config: TSRendererConfig): TSRenderer {
  return new TSRendererImpl(config);
}
