import { resolve } from 'path';

import type { TypeSync, TypeSyncGenerateOptions, TypeSyncGenerateResult } from '../api.js';
import { InvalidIndentationOption } from '../errors/index.js';
import { type Generator } from '../generators/index.js';
import { createPythonGenerator } from '../generators/python/index.js';
import { createTSGenerator } from '../generators/ts/index.js';
import { renderers } from '../renderers/index.js';
import { schema } from '../schema/index.js';
import { assertNever } from '../util/assert.js';
import { writeFile } from '../util/fs.js';
import { createDefinitionParser } from './definition-parser.js';
import { createLogger } from './logger.js';

class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions): Promise<TypeSyncGenerateResult> {
    const logger = createLogger(opts.debug);
    this.validateOpts(opts);

    const { pathToDefinition, pathToOutputDir } = opts;
    const generator = this.createGenerator(opts);
    const renderer = this.createRenderer(opts);
    const parser = createDefinitionParser(logger);

    const def = parser.parseDefinition(pathToDefinition);
    const s = schema.createSchema(def);
    const g = generator.generate(s);
    const { rootFile, files } = await renderer.render(g);

    await this.writeRenderedFiles(pathToOutputDir, files);
    const pathToRootFile = resolve(pathToOutputDir, rootFile.relativePath);

    return {
      aliasModelCount: s.aliasModels.length,
      documentModelCount: s.documentModels.length,
      pathToRootFile,
    };
  }

  private validateOpts(opts: TypeSyncGenerateOptions) {
    const { indentation } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidIndentationOption(indentation);
    }
  }

  private createGenerator(opts: TypeSyncGenerateOptions): Generator {
    const { platform } = opts;
    switch (platform) {
      case 'ts:firebase-admin:11':
        return createTSGenerator({ platform });
      case 'py:firebase-admin:6':
        return createPythonGenerator({ platform });
      default:
        assertNever(platform);
    }
  }

  private createRenderer(opts: TypeSyncGenerateOptions): renderers.Renderer {
    const { platform, indentation } = opts;
    switch (platform) {
      case 'ts:firebase-admin:11':
        return renderers.createTSRenderer({ rootFileName: 'index.ts', platform, indentation });
      case 'py:firebase-admin:6':
        return renderers.createPythonRenderer({ rootFileName: 'models.py', platform, indentation });
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
