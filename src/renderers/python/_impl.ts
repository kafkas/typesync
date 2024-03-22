import { StringBuilder } from '@proficient/ds';

import type {
  PythonAliasDeclaration,
  PythonDeclaration,
  PythonEnumClassDeclaration,
  PythonGeneration,
  PythonPydanticClassDeclaration,
} from '../../generators/python';
import { python } from '../../platforms/python';
import { assertNever } from '../../util/assert';
import { multiply } from '../../util/multiply-str';
import { space } from '../../util/space';
import type { RenderedFile } from '../_types';
import type { PythonRenderer, PythonRendererConfig } from './_types';

class PythonRendererImpl implements PythonRenderer {
  public readonly type = 'python';

  public constructor(private readonly config: PythonRendererConfig) {}

  public async render(g: PythonGeneration): Promise<RenderedFile[]> {
    const b = new StringBuilder();

    b.append(`${this.generateImportStatements()}\n\n`);
    b.append(`${this.generateStaticDeclarations()}\n`);
    b.append(`# Model Definitions\n\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)}\n\n`);
    });

    const renderedFile: RenderedFile = {
      relativePath: this.config.rootFileName,
      content: b.toString(),
    };

    return [renderedFile];
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

  private renderDeclaration(declaration: PythonDeclaration) {
    switch (declaration.type) {
      case 'alias':
        return this.renderAliasDeclaration(declaration);
      case 'enum-class':
        return this.renderEnumClassDeclaration(declaration);
      case 'pydantic-class': {
        return this.renderPydanticClassDeclaration(declaration);
      }
      default:
        assertNever(declaration);
    }
  }

  private renderAliasDeclaration(declaration: PythonAliasDeclaration) {
    const { modelName, modelType } = declaration;
    const expression = python.expressionForType(modelType);
    return `${modelName} = ${expression.content};`;
  }

  private renderEnumClassDeclaration(declaration: PythonEnumClassDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    b.append(`class ${modelName}(enum.Enum):\n`);
    modelType.attributes.forEach(attribute => {
      b.append(`${this.indent(1)}${attribute.key} = ${this.enumClassAttributeValueAsString(attribute)}\n`);
    });
    b.append('\n');
    return b.toString();
  }

  private enumClassAttributeValueAsString(attribute: python.EnumClassAttribute) {
    switch (typeof attribute.value) {
      case 'string':
        return `"${attribute.value}"`;
      case 'number':
        return `${attribute.value}`;
      default:
        assertNever(attribute.value);
    }
  }

  private renderPydanticClassDeclaration(declaration: PythonPydanticClassDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    b.append(`class ${modelName}(pydantic.BaseModel):\n`);
    modelType.attributes.forEach(attribute => {
      const expression = python.expressionForType(attribute.type);
      b.append(`${this.indent(1)}${attribute.name}: ${expression.content}\n`);
    });
    b.append('\n');
    return b.toString();
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createPythonRenderer(config: PythonRendererConfig): PythonRenderer {
  return new PythonRendererImpl(config);
}
