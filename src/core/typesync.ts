import { resolve } from 'path';

import type { TypeSync, TypeSyncGenerateOptions } from '../api';
import { InvalidIndentationOption } from '../errors';
import { type Generator } from '../generators';
import { createPythonGenerator } from '../generators/python';
import { createTSGenerator } from '../generators/ts';
import { renderers } from '../renderers';
import { schema } from '../schema';
import { assertNever } from '../util/assert';
import { writeFile } from '../util/fs';
import { createDefinitionParser } from './definition-parser';
import { createLogger } from './logger';

class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions) {
    const logger = createLogger(opts.debug);
    this.validateOpts(opts);

    const { pathToDefinition, pathToOutputDir } = opts;
    const generator = this.createGenerator(opts);
    const renderer = this.createRenderer(opts);
    const parser = createDefinitionParser(logger);

    const def = parser.parseDefinition(pathToDefinition);
    const s = schema.createSchema(def);
    const g = generator.generate(s);
    const files = renderer.render(g);

    await this.writeRenderedFiles(pathToOutputDir, files);
  }

  private validateOpts(opts: TypeSyncGenerateOptions) {
    const { indentation } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidIndentationOption(indentation);
    }
  }

  private createGenerator(opts: TypeSyncGenerateOptions): Generator {
    const { platform, indentation } = opts;
    switch (platform) {
      case 'ts:firebase-admin:11':
        return createTSGenerator({ platform, indentation });
      case 'py:firebase-admin:6':
        return createPythonGenerator({ platform, indentation });
      default:
        assertNever(platform);
    }
  }

  private createRenderer(opts: TypeSyncGenerateOptions): renderers.Renderer {
    const { platform, indentation } = opts;
    switch (platform) {
      case 'ts:firebase-admin:11':
        return renderers.ts.create({ rootFileName: 'index.ts', platform });
      case 'py:firebase-admin:6':
        return renderers.python.create({ rootFileName: 'models.py', platform, indentation });
      default:
        assertNever(platform);
    }
  }

  private async writeRenderedFiles(pathToOutputDir: string, files: renderers.RenderedFile[]) {
    await Promise.all(
      files.map(async file => {
        const path = resolve(pathToOutputDir, file.relativePath);
        await writeFile(path, file.content);
      })
    );
  }
}

export function createTypeSync(): TypeSync {
  return new TypeSyncImpl();
}
