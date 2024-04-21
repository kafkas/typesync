import { StringBuilder } from '@proficient/ds';

import type {
  SwiftDeclaration,
  SwiftDiscriminatedUnionEnumDeclaration,
  SwiftGeneration,
  SwiftIntEnumDeclaration,
  SwiftStringEnumDeclaration,
  SwiftStructDeclaration,
  SwiftTypealiasDeclaration,
} from '../../generators/swift/index.js';
import { swift } from '../../platforms/swift/index.js';
import { assertNever } from '../../util/assert.js';
import { camelCase, pascalCase } from '../../util/casing.js';
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
      case 'discriminated-union-enum':
        return this.renderDiscriminatedUnionEnumDeclaration(declaration);
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
    const conformedProtocolsAsString = ['String', 'Codable'].join(', ');
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
    const conformedProtocolsAsString = ['Int', 'Codable'].join(', ');
    b.append(`enum ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.cases.forEach(({ key, value }) => {
      b.append('\t');
      b.append(`case ${key} = ${value}` + '\n');
    });
    b.append(`}`);
    return b.toString();
  }

  public renderDiscriminatedUnionEnumDeclaration(declaration: SwiftDiscriminatedUnionEnumDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    const conformedProtocolsAsString = ['Codable'].join(', ');
    b.append(`enum ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.values.forEach(({ structName, discriminantValue }) => {
      b.append('\t');
      b.append(`case ${camelCase(discriminantValue)}(${structName})` + '\n');
    });

    b.append('\n');

    b.append(`\tprivate enum CodingKeys: String, CodingKey {` + '\n');
    b.append(`\t\tcase ${camelCase(modelType.discriminant)}`);
    if (camelCase(modelType.discriminant) !== modelType.discriminant) {
      b.append(` = ${modelType.discriminant}`);
    }
    b.append(`\n\t}\n`);
    b.append('\n');

    b.append(`\tenum ${modelName}${pascalCase(modelType.discriminant)}: String, Codable {` + '\n');
    modelType.values.forEach(({ discriminantValue }) => {
      b.append(`\t\tcase ${camelCase(discriminantValue)}`);
      if (camelCase(discriminantValue) !== discriminantValue) {
        b.append(` = "${discriminantValue}"`);
      }
      b.append('\n');
    });
    b.append(`\t}\n`);

    b.append('\n');

    b.append(`\tinit(from decoder: Decoder) throws {` + '\n');
    b.append(`\t\tlet container = try decoder.container(keyedBy: CodingKeys.self)` + `\n`);
    b.append(
      `\t\tlet ${camelCase(modelType.discriminant)} = try container.decode(${modelName}${pascalCase(modelType.discriminant)}.self, forKey: .${camelCase(modelType.discriminant)})` +
        `\n`
    );
    b.append(`\t\tswitch ${camelCase(modelType.discriminant)} {` + `\n`);
    modelType.values.forEach(({ structName, discriminantValue }) => {
      b.append(`\t\tcase .${camelCase(discriminantValue)}:` + `\n`);
      b.append(`\t\t\tself = .${camelCase(discriminantValue)}(try ${structName}(from: decoder))` + `\n`);
    });
    b.append(`\t\t}` + `\n`);
    b.append(`\t}\n`);

    b.append('\n');

    b.append(`\tfunc encode(to encoder: Encoder) throws {` + `\n`);
    b.append(`\t\tvar container = encoder.container(keyedBy: CodingKeys.self)` + `\n`);
    b.append(`\t\tswitch self {` + `\n`);
    modelType.values.forEach(({ discriminantValue }) => {
      b.append(`\t\tcase .${camelCase(discriminantValue)}(let obj):` + `\n`);
      b.append(
        `\t\t\ttry container.encode(${modelName}${pascalCase(modelType.discriminant)}.${camelCase(discriminantValue)}.rawValue, forKey: .${camelCase(modelType.discriminant)})` +
          `\n`
      );
      b.append(`\t\t\ttry obj.encode(to: encoder)` + `\n`);
    });
    b.append(`\t\t}` + `\n`);

    b.append(`\t}` + `\n`);

    b.append(`}`);

    return b.toString();
  }

  public renderStructDeclaration(declaration: SwiftStructDeclaration) {
    const { modelName, modelType } = declaration;
    const propertyOriginalNames = [...modelType.literalProperties, ...modelType.regularProperties].map(
      p => p.originalName
    );
    const hasNonCamelCaseOriginalName = propertyOriginalNames.some(name => camelCase(name) !== name);
    const b = new StringBuilder();
    const conformedProtocolsAsString = ['Codable'].join(', ');
    b.append(`struct ${modelName}: ${conformedProtocolsAsString} {` + '\n');
    modelType.literalProperties.forEach(property => {
      const expression = swift.expressionForType(property.type);
      b.append('\t');
      b.append(
        `private(set) var ${camelCase(property.originalName)}: ${expression.content} = ${property.literalValue}` + '\n'
      );
    });
    modelType.regularProperties.forEach(property => {
      const expression = swift.expressionForType(property.type);
      b.append('\t');
      b.append(`var ${camelCase(property.originalName)}: ${expression.content}${property.optional ? '?' : ''}` + '\n');
    });
    if (hasNonCamelCaseOriginalName) {
      b.append('\n');
      b.append(`\tprivate enum CodingKeys: String, CodingKey {` + '\n');
      propertyOriginalNames.forEach(originalName => {
        b.append(`\t\tcase ${camelCase(originalName)}`);
        if (camelCase(originalName) !== originalName) {
          b.append(` = "${originalName}"`);
        }
        b.append('\n');
      });
      b.append(`\t}\n`);
    }
    b.append(`}`);
    return b.toString();
  }
}

export function createSwiftRenderer(config: SwiftRendererConfig): SwiftRenderer {
  return new SwiftRendererImpl(config);
}
