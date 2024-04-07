import { globSync } from 'glob';
import { resolve } from 'path';

import type {
  TypeSync,
  TypeSyncGenerateOptions,
  TypeSyncGenerateResult,
  TypeSyncValidateOptions,
  TypeSyncValidateResult,
} from '../api.js';
import { DefinitionFilesNotFoundError, InvalidIndentationOption } from '../errors/index.js';
import { type Generator } from '../generators/index.js';
import { createPythonGenerator } from '../generators/python/index.js';
import { createTSGenerator } from '../generators/ts/index.js';
import { renderers } from '../renderers/index.js';
import { schema } from '../schema/index.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { writeFile } from '../util/fs.js';
import { createDefinitionParser } from './definition-parser.js';
import { createLogger } from './logger.js';

class TypeSyncImpl implements TypeSync {
  public async generate(opts: TypeSyncGenerateOptions): Promise<TypeSyncGenerateResult> {
    const logger = createLogger(opts.debug);
    this.validateOpts(opts);

    const { definition: definitionGlobPattern, pathToOutputDir } = opts;
    const generator = this.createGenerator(opts);
    const renderer = this.createRenderer(opts);
    const parser = createDefinitionParser(logger);

    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);
    logger.info(`Found ${definitionFilePaths.length} files matching Glob pattern:`, definitionFilePaths);

    const definition = parser.parseDefinition(definitionFilePaths);
    const s = schema.createSchema(definition);
    const generation = generator.generate(s);
    const { rootFile, files } = await renderer.render(generation);

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

  public async validate(opts: TypeSyncValidateOptions): Promise<TypeSyncValidateResult> {
    const logger = createLogger(opts.debug);

    const { definition: definitionGlobPattern } = opts;
    const parser = createDefinitionParser(logger);
    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);

    try {
      parser.parseDefinition(definitionFilePaths);
      return { success: true };
    } catch (e) {
      return { success: false, message: extractErrorMessage(e) };
    }
  }

  private findDefinitionFilesMatchingPattern(globPattern: string) {
    const filePaths = globSync(globPattern);
    if (filePaths.length === 0) {
      throw new DefinitionFilesNotFoundError(globPattern);
    }
    return filePaths as [string, ...string[]];
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
