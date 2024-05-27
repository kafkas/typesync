import { StringBuilder } from '@proficient/ds';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

import {
  MisplacedStartMarkerError,
  MissingEndMarkerError,
  MissingRulesOutputFileError,
  MissingStartMarkerError,
} from '../../errors/renderer.js';
import type {
  RulesGeneration,
  RulesReadonlyFieldValidatorDeclaration,
  RulesTypeValidatorDeclaration,
} from '../../generators/rules/index.js';
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
        const renderedTypeValidatorDeclarations = g.typeValidatorDeclarations.map(d =>
          this.renderTypeValidatorDeclaration(d)
        );
        const renderedReadonlyFieldDeclarations = g.readonlyFieldValidatorDeclarations.map(d =>
          this.renderReadonlyFieldValidatorDeclaration(d)
        );
        const renderedDeclarations = [...renderedTypeValidatorDeclarations, ...renderedReadonlyFieldDeclarations].join(
          '\n\n'
        );
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

    if (!existsSync(pathToOutputFile)) {
      throw new MissingRulesOutputFileError(pathToOutputFile);
    }

    const outputFileContent = (await readFile(pathToOutputFile)).toString();
    const lines = outputFileContent.split('\n');
    const startMarkerLineIdx = lines.findIndex(line => this.doesLineContainMarker(line, startMarker));
    const endMarkerLineIdx = lines.findIndex(line => this.doesLineContainMarker(line, endMarker));

    if (startMarkerLineIdx === -1) {
      throw new MissingStartMarkerError(pathToOutputFile, startMarker);
    }

    if (endMarkerLineIdx === -1) {
      throw new MissingEndMarkerError(pathToOutputFile, endMarker);
    }

    if (startMarkerLineIdx >= endMarkerLineIdx) {
      throw new MisplacedStartMarkerError(pathToOutputFile, startMarker, endMarker);
    }

    lines.splice(startMarkerLineIdx + 1, endMarkerLineIdx - startMarkerLineIdx - 1);

    return { lines, startMarkerLineIdx };
  }

  private doesLineContainMarker(line: string, marker: string) {
    if (!line.trimStart().startsWith('//')) return false;
    const parts = line.split(' ');
    return parts.some(part => part === marker);
  }

  private renderTypeValidatorDeclaration(declaration: RulesTypeValidatorDeclaration) {
    const { validatorName, paramName, predicate } = declaration;
    const b = new StringBuilder();
    b.append(`${this.indent(1)}function ${validatorName}(${paramName}) {` + `\n`);
    b.append(`${this.indent(2)}return ` + this.renderPredicate(predicate) + `;\n`);
    b.append(`${this.indent(1)}}`);
    return b.toString();
  }

  private renderReadonlyFieldValidatorDeclaration(declaration: RulesReadonlyFieldValidatorDeclaration) {
    const { validatorName, prevDataParamName, nextDataParamName } = declaration;
    const b = new StringBuilder();
    b.append(`${this.indent(1)}function ${validatorName}(${prevDataParamName}, ${nextDataParamName}) {` + `\n`);
    // TODO: Implement
    b.append(`${this.indent(2)}return ` + 'false' + `;\n`);
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
      case 'readonly-field-validator':
        return this.renderReadonlyFieldValidatorPredicate(predicate);
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
    return `${predicate.validatorName}(${predicate.varName})`;
  }

  private renderReadonlyFieldValidatorPredicate(predicate: rules.ReadonlyFieldValidatorPredicate) {
    return `${predicate.validatorName}(${predicate.prevDataParam}, ${predicate.nextDataParam})`;
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
        `${predicate.innerPredicates.map(p => `${this.indent(2)}${this.renderPredicate(p)}`).join(' &&\n')}` +
        `\n${this.indent(2)})`
      );
    } else {
      return `(${predicate.innerPredicates.map(p => this.renderPredicate(p)).join(' && ')})`;
    }
  }

  private renderNegationPredicate(predicate: rules.NegationPredicate) {
    return `!${this.renderPredicate(predicate.originalPredicate)}`;
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createRulesRenderer(config: RulesRendererConfig): RulesRenderer {
  return new RulesRendererImpl(config);
}
