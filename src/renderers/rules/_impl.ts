import { StringBuilder } from '@proficient/ds';

import type { RulesDeclaration, RulesGeneration, RulesValidatorDeclaration } from '../../generators/rules/index.js';
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
      b.append(`${this.renderDeclaration(declaration)};\n\n`);
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
    const { modelName } = declaration;
    const b = new StringBuilder();
    // TODO: Make dynamic with according to the `pattern` input
    b.append(`${this.indent(1)}function is${modelName}Valid() {` + `\n`);
    // TODO: Implement
    b.append(`${this.indent(2)}return true;`);
    b.append(`${this.indent(1)}}`);
  }

  private indent(count: number) {
    return multiply(space(this.config.indentation), count);
  }
}

export function createRulesRenderer(config: RulesRendererConfig): RulesRenderer {
  return new RulesRendererImpl(config);
}
