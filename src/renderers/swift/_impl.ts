import { StringBuilder } from '@proficient/ds';

import type {
  SwiftDeclaration,
  SwiftEnumWithAssociatedValuesDeclaration,
  SwiftGeneration,
  SwiftIntEnumDeclaration,
  SwiftStringEnumDeclaration,
  SwiftStructDeclaration,
  SwiftTypealiasDeclaration,
} from '../../generators/swift/index.js';
import { swift } from '../../platforms/swift/index.js';
import { assertNever } from '../../util/assert.js';
import type { RenderedFile } from '../_types.js';
import type { SwiftRenderer, SwiftRendererConfig } from './_types.js';

class SwiftRendererImpl implements SwiftRenderer {
  public readonly type = 'swift';

  public constructor(private readonly config: SwiftRendererConfig) {}

  public async render(g: SwiftGeneration): Promise<RenderedFile> {
    const b = new StringBuilder();

    b.append(`${this.generateImportStatements()}\n\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)}\n\n`);
    });

    const rootFile: RenderedFile = {
      content: b.toString(),
    };

    return rootFile;
  }

  private generateImportStatements() {
    const b = new StringBuilder();
    b.append(`import Foundation`);
    return b.toString();
  }

  private renderDeclaration(declaration: SwiftDeclaration) {
    switch (declaration.type) {
      case 'typealias':
        return this.renderTypealiasDeclaration(declaration);
      case 'string-enum':
        return this.renderStringEnumDeclaration(declaration);
      case 'int-enum':
        return this.renderIntEnumDeclaration(declaration);
      case 'enum-with-associated-values':
        return this.renderEnumWithAssociatedValuesDeclaration(declaration);
      case 'struct':
        return this.renderStructDeclaration(declaration);
      default:
        assertNever(declaration);
    }
  }

  public renderTypealiasDeclaration(declaration: SwiftTypealiasDeclaration) {
    const { modelName, modelType } = declaration;
    const expression = swift.expressionForType(modelType);
    return `typealias ${modelName} = ${expression.content}`;
  }

  public renderStringEnumDeclaration(declaration: SwiftStringEnumDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    const conformedProtocolsAsString = ['String'].join(', ');
    b.append(`enum ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.cases.forEach(({ key, value }) => {
      b.append('\t');
      b.append(`case ${key} = "${value}"` + '\n');
    });
    b.append(`}`);
    return b.toString();
  }

  public renderIntEnumDeclaration(declaration: SwiftIntEnumDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    const conformedProtocolsAsString = ['Int'].join(', ');
    b.append(`enum ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.cases.forEach(({ key, value }) => {
      b.append('\t');
      b.append(`case ${key} = ${value}` + '\n');
    });
    b.append(`}`);
    return b.toString();
  }

  public renderEnumWithAssociatedValuesDeclaration(declaration: SwiftEnumWithAssociatedValuesDeclaration) {
    // TODO: Implement
    return ``;
  }

  public renderStructDeclaration(declaration: SwiftStructDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    const conformedProtocolsAsString = ['Codable'].join(', ');
    b.append(`struct ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.properties.forEach(property => {
      const expression = swift.expressionForType(property.type);
      b.append('\t');
      b.append(`var ${property.name}: ${expression.content}` + '\n');
    });
    b.append(`}`);
    return b.toString();
  }
}

export function createSwiftRenderer(config: SwiftRendererConfig): SwiftRenderer {
  return new SwiftRendererImpl(config);
}
