import { StringBuilder } from '@proficient/ds';
import { format } from 'prettier';

import type { ZodGenerationTarget } from '../../api/index.js';
import type { ZodGeneration, ZodSchemaDeclaration } from '../../generators/zod/index.js';
import { assertNever } from '../../util/assert.js';
import type { RenderedFile } from '../_types.js';
import type { ZodRenderer, ZodRendererConfig } from './_types.js';

class ZodRendererImpl implements ZodRenderer {
  public constructor(private readonly config: ZodRendererConfig) {}

  public async render(g: ZodGeneration): Promise<RenderedFile> {
    const b = new StringBuilder();

    const imports = this.renderImports(g);
    if (imports.length > 0) {
      b.append(`${imports}\n\n`);
    }

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)}\n\n`);
    });

    const content = b.toString();
    const formattedContent = await format(content, {
      parser: 'typescript',
      tabWidth: this.config.indentation,
      trailingComma: 'es5',
      printWidth: 120,
      singleQuote: true,
    });

    return { content: formattedContent };
  }

  private renderDeclaration(declaration: ZodSchemaDeclaration): string {
    let output = '';
    if (declaration.modelDocs !== null) {
      output += `/** ${declaration.modelDocs} */\n`;
    }
    output += `export const ${declaration.schemaName} = ${declaration.expression};`;
    return output;
  }

  private renderImports(g: ZodGeneration): string {
    const lines: string[] = [];

    const firestoreImport = this.getFirestoreImportStatement(g);
    if (firestoreImport !== null) {
      lines.push(firestoreImport);
    }

    lines.push(`import { z } from 'zod';`);
    return lines.join('\n');
  }

  /**
   * Computes the Firestore SDK import (if any) needed by the rendered file. We
   * intentionally key off the generation's `usesTimestamp` / `usesBytes` flags
   * rather than scanning the rendered string so that the renderer stays in lock
   * step with the generator's intent and emits no dead imports.
   */
  private getFirestoreImportStatement(g: ZodGeneration): string | null {
    const needsTimestampImport = g.usesTimestamp;
    const needsBytesImport = g.usesBytes && bytesRequiresFirestoreImport(this.config.target);

    if (!needsTimestampImport && !needsBytesImport) return null;

    return getFirestoreImportForTarget(this.config.target);
  }
}

function bytesRequiresFirestoreImport(target: ZodGenerationTarget): boolean {
  switch (target) {
    case 'firebase-admin@13':
    case 'firebase-admin@12':
    case 'firebase-admin@11':
    case 'firebase-admin@10':
      // Bytes use the global Node `Buffer` on admin, so no SDK import is needed.
      return false;
    case 'firebase@11':
    case 'firebase@10':
    case 'firebase@9':
    case 'react-native-firebase@21':
    case 'react-native-firebase@20':
    case 'react-native-firebase@19':
      return true;
    default:
      assertNever(target);
  }
}

function getFirestoreImportForTarget(target: ZodGenerationTarget): string {
  switch (target) {
    case 'firebase-admin@13':
    case 'firebase-admin@12':
      return `import * as firestore from 'firebase-admin/firestore';`;
    case 'firebase-admin@11':
    case 'firebase-admin@10':
      return `import { firestore } from 'firebase-admin';`;
    case 'firebase@11':
    case 'firebase@10':
    case 'firebase@9':
      return `import * as firestore from 'firebase/firestore';`;
    case 'react-native-firebase@21':
    case 'react-native-firebase@20':
    case 'react-native-firebase@19':
      return `import * as firestore from '@react-native-firebase/firestore';`;
    default:
      assertNever(target);
  }
}

export function createZodRenderer(config: ZodRendererConfig): ZodRenderer {
  return new ZodRendererImpl(config);
}
