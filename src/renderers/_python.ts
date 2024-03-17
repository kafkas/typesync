import { StringBuilder } from '@proficient/ds';

import { type generation } from '../generation';
import { PythonGeneration } from '../generation/_types';
import { python } from '../platforms/python';
import { assertNever } from '../util/assert';
import { multiply } from '../util/multiply-str';
import { space } from '../util/space';
import { PythonRenderer, PythonRendererConfig, RenderedFile } from './_types';

class PythonRendererImpl implements PythonRenderer {
  public readonly type = 'python';

  public constructor(private readonly config: PythonRendererConfig) {}

  public render(g: PythonGeneration): RenderedFile[] {
    const b = new StringBuilder();

    b.append(`${this.generateImportStatements()}\n\n`);
    b.append(`${this.generateStaticDeclarations()}\n`);
    b.append(`# Model Definitions\n\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)};\n\n`);
    });

    return [];
  }

  private generateStaticDeclarations() {
    const b = new StringBuilder();
    b.append(`class TypeSyncUndefined:\n`);
    b.append(`${this.indent(1)}_instance = None\n\n`);
    b.append(`${this.indent(1)}def __init__(self):\n`);
    b.append(`${this.indent(2)}if TypeSyncUndefined._instance is not None:\n`);
    b.append(
      `${this.indent(3)}raise RuntimeError("TypeSyncUndefined instances cannot be created directly. Use UNDEFINED instead.")\n`
    );
    b.append(`${this.indent(2)}else:\n`);
    b.append(`${this.indent(3)}TypeSyncUndefined._instance = self\n\n`);
    b.append(`UNDEFINED = TypeSyncUndefined()\n`);
    return b.toString();
  }

  private generateImportStatements() {
    const b = new StringBuilder();
    b.append(`from __future__ import annotations\n\n`);
    b.append(`import typing\n`);
    b.append(`import datetime\n`);
    b.append(`import enum\n`);
    b.append(`import pydantic`);
    return b.toString();
  }

  private renderDeclaration(declaration: generation.PythonDeclaration) {
    switch (declaration.type) {
      case 'alias': {
        const { modelName, modelType } = declaration;
        const expression = python.expressionForType(modelType);
        return `${modelName} = ${expression.content};`;
      }
      case 'enum-class': {
        // TODO: Implement
        return `TODO`;
      }
      case 'pydantic-class': {
        // TODO: Implement
        return `TODO`;
      }
      default:
        assertNever(declaration);
    }
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function create(config: PythonRendererConfig): PythonRenderer {
  return new PythonRendererImpl(config);
}
