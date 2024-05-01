import { StringBuilder } from '@proficient/ds';

import type { RulesDeclaration, RulesGeneration, RulesValidatorDeclaration } from '../../generators/rules/index.js';
import { rules } from '../../platforms/rules/index.js';
import { assertNever } from '../../util/assert.js';
import { multiply } from '../../util/multiply-str.js';
import { space } from '../../util/space.js';
import type { RenderedFile } from '../_types.js';
import type { RulesRenderer, RulesRendererConfig } from './_types.js';

class RulesRendererImpl implements RulesRenderer {
  public constructor(private readonly config: RulesRendererConfig) {}

  public async render(g: RulesGeneration): Promise<RenderedFile> {
    const b = new StringBuilder();
    b.append(`rules_version = '2';` + `\n`);
    b.append(`service cloud.firestore {` + `\n`);

    g.declarations.forEach(declaration => {
      b.append(`${this.renderDeclaration(declaration)}\n\n`);
    });

    b.append('}');

    const rootFile: RenderedFile = {
      content: b.toString(),
    };

    return rootFile;
  }

  private renderDeclaration(declaration: RulesDeclaration) {
    switch (declaration.type) {
      case 'validator':
        return this.renderValidatorDeclaration(declaration);
      default:
        assertNever(declaration.type);
    }
  }

  private renderValidatorDeclaration(declaration: RulesValidatorDeclaration) {
    const { modelName, modelType } = declaration;
    const b = new StringBuilder();
    // TODO: Make dynamic with according to the `pattern` input
    const varName = 'data';
    b.append(`${this.indent(1)}function isValid${modelName}(${varName}) {` + `\n`);
    if (modelType.type === 'object') {
      b.append(`${this.indent(2)}return (` + `\n`);
      b.append(this.renderPredicateForType(modelType, varName, 0) + `\n`);
      b.append(`${this.indent(2)});` + `\n`);
    } else {
      b.append(`${this.indent(2)}return ${this.renderPredicateForType(modelType, varName, 0)};` + `\n`);
    }
    b.append(`${this.indent(1)}}`);
    return b.toString();
  }

  private renderPredicateForType(type: rules.Type, varName: string, depth: number): string {
    switch (type.type) {
      case 'any':
        return `true`;
      case 'string':
      case 'bool':
      case 'float':
      case 'int':
      case 'timestamp':
      case 'list':
      case 'map':
        return `(${varName} is ${type.type})`;
      case 'literal':
        return `(${varName} == ${typeof type.value === 'string' ? `"${type.value}"` : type.value})`;
      case 'enum': {
        const innerPredicates = type.members.map(
          member => `${varName} == ${typeof member.value === 'string' ? `"${member.value}"` : member.value}`
        );
        return `(${innerPredicates.join(' || ')})`;
      }
      case 'tuple': {
        const predicates = [
          `(${varName} is list)`,
          ...type.elements.map(
            (elementType, elementIdx) =>
              `${this.renderPredicateForType(elementType, `${varName}[${elementIdx}]`, depth + 1)}`
          ),
        ];
        return predicates.join(' && ');
      }
      case 'object': {
        const predicates = [
          `(${varName} is map)`,
          ...type.fields.map(
            field => `${this.renderPredicateForType(field.type, `${varName}.${field.name}`, depth + 1)}`
          ),
        ].map(p => `${depth === 0 ? this.indent(3) : ''}${p}`);
        return predicates.join(' &&\n');
      }
      case 'discriminated-union':
      case 'simple-union':
        // TODO: Implement
        return `true`;
      default:
        assertNever(type);
    }
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createRulesRenderer(config: RulesRendererConfig): RulesRenderer {
  return new RulesRendererImpl(config);
}
