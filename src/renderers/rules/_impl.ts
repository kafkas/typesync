import { StringBuilder } from '@proficient/ds';
import { readFile } from 'fs/promises';

import { MisplacedStartMarkerError, MissingEndMarkerError, MissingStartMarkerError } from '../../errors/renderer.js';
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

    const { lines, startMarkerLineIdx } = await this.preprocessOutputFile();

    lines.forEach((line, lineIdx) => {
      if (lineIdx === startMarkerLineIdx + 1) {
        const renderedDeclarations = g.declarations.map(d => this.renderDeclaration(d)).join('\n\n');
        b.append(renderedDeclarations + `\n`);
      }
      b.append(`${line}`);
      if (lineIdx !== lines.length - 1) {
        b.append('\n');
      }
    });

    const rootFile: RenderedFile = {
      content: b.toString(),
    };

    return rootFile;
  }

  private async preprocessOutputFile() {
    const { pathToOutputFile, startMarker, endMarker } = this.config;

    const outputFileContent = (await readFile(pathToOutputFile)).toString();
    const lines = outputFileContent.split('\n');
    const startMarkerLineIdx = lines.findIndex(line => line.includes(startMarker));
    const endMarkerLineIdx = lines.findIndex(line => line.includes(endMarker));

    if (startMarkerLineIdx === -1) {
      throw new MissingStartMarkerError(pathToOutputFile, startMarker);
    }

    if (endMarkerLineIdx === -1) {
      throw new MissingEndMarkerError(pathToOutputFile, startMarker);
    }

    if (startMarkerLineIdx >= endMarkerLineIdx) {
      throw new MisplacedStartMarkerError(pathToOutputFile, startMarker, endMarker);
    }

    lines.splice(startMarkerLineIdx + 1, endMarkerLineIdx - startMarkerLineIdx - 1);

    return { lines, startMarkerLineIdx };
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
    const varName = this.config.validatorParamName;
    b.append(`${this.indent(1)}function ${this.validatorPredicate(modelName)}(${varName}) {` + `\n`);
    const predicate = rules.predicateForType(modelType, varName);
    b.append(`${this.indent(2)}return ` + this.renderPredicate(predicate) + `;\n`);
    b.append(`${this.indent(1)}}`);
    return b.toString();
  }

  private renderPredicate(predicate: rules.Predicate): string {
    switch (predicate.type) {
      case 'value-equality':
        return this.renderValueEqualityPredicate(predicate);
      case 'type-equality':
        return this.renderTypeEqualityPredicate(predicate);
      case 'type-validator':
        return this.renderTypeValidatorPredicate(predicate);
      case 'map-has-key':
        return this.renderMapHasKeyPredicate(predicate);
      case 'map-has-only-keys':
        return this.renderMapHasOnlyKeysPredicate(predicate);
      case 'literal':
        return this.renderLiteralPredicate(predicate);
      case 'or':
        return this.renderOrPredicate(predicate);
      case 'and':
        return this.renderAndPredicate(predicate);
      case 'negation':
        return this.renderNegationPredicate(predicate);
      default:
        assertNever(predicate);
    }
  }

  private renderValueEqualityPredicate(predicate: rules.ValueEqualityPredicate) {
    return `(${predicate.varName} == ${predicate.varValue})`;
  }

  private renderTypeEqualityPredicate(predicate: rules.TypeEqualityPredicate) {
    return `(${predicate.varName} is ${predicate.varType.type})`;
  }

  private renderTypeValidatorPredicate(predicate: rules.TypeValidatorPredicate) {
    return `${this.validatorPredicate(predicate.varModelName)}(${predicate.varName})`;
  }

  private renderMapHasKeyPredicate(predicate: rules.MapHasKeyPredicate) {
    return `('${predicate.key}' in ${predicate.varName})`;
  }

  private renderMapHasOnlyKeysPredicate(predicate: rules.MapHasOnlyKeysPredicate) {
    return `(${predicate.varName}.keys().hasOnly([${predicate.keys.map(k => `'${k}'`).join(', ')}]))`;
  }

  private renderLiteralPredicate(predicate: rules.LiteralPredicate) {
    return predicate.value;
  }

  private renderOrPredicate(predicate: rules.OrPredicate) {
    return `(${predicate.innerPredicates.map(p => this.renderPredicate(p)).join(' || ')})`;
  }

  private renderAndPredicate(predicate: rules.AndPredicate) {
    if (predicate.alignment === 'vertical') {
      return (
        `(\n` +
        `${predicate.innerPredicates.map(p => `${this.indent(3)}${this.renderPredicate(p)}`).join(' &&\n')}` +
        `\n${this.indent(2)})`
      );
    } else {
      return `(${predicate.innerPredicates.map(p => this.renderPredicate(p)).join(' && ')})`;
    }
  }

  private renderNegationPredicate(predicate: rules.NegationPredicate) {
    return `!${this.renderPredicate(predicate.originalPredicate)}`;
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
