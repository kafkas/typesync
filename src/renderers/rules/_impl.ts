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

    const renderedDeclarations = g.declarations.map(d => this.renderDeclaration(d)).join('\n\n');
    b.append(renderedDeclarations + `\n`);

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
    // TODO: Should be a config option
    const varName = 'data';
    b.append(`${this.indent(1)}function ${this.validatorPredicate(modelName)}(${varName}) {` + `\n`);
    const predicate = rules.predicateForType(modelType, varName);
    b.append(`${this.indent(2)}return ` + this.renderPredicate(predicate) + `;\n`);
    b.append(`${this.indent(1)}}`);
    return b.toString();
  }

  private renderPredicate(predicate: rules.Predicate): string {
    switch (predicate.type) {
      case 'value-equality':
        return `(${predicate.varName} == ${predicate.varValue})`;
      case 'type-equality':
        return `(${predicate.varName} is ${predicate.varType.type})`;
      case 'type-validator':
        return `${this.validatorPredicate(predicate.varModelName)}(${predicate.varName})`;
      case 'field-exists-in-map':
        return `('${predicate.fieldName}' in ${predicate.varName})`;
      case 'literal':
        return predicate.value;
      case 'or':
        return `(${predicate.innerPredicates.map(p => this.renderPredicate(p)).join(' || ')})`;
      case 'and':
        if (predicate.alignment === 'vertical') {
          return (
            `(\n` +
            `${predicate.innerPredicates.map(p => `${this.indent(3)}${this.renderPredicate(p)}`).join(' &&\n')}` +
            `\n${this.indent(2)})`
          );
        } else {
          return `(${predicate.innerPredicates.map(p => this.renderPredicate(p)).join(' && ')})`;
        }
      case 'negation':
        return `!${this.renderPredicate(predicate.originalPredicate)}`;
      default:
        assertNever(predicate);
    }
  }

  private validatorPredicate(modelName: string) {
    // TODO: Make dynamic with according to the `pattern` input
    return `isValid${modelName}`;
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createRulesRenderer(config: RulesRendererConfig): RulesRenderer {
  return new RulesRendererImpl(config);
}
