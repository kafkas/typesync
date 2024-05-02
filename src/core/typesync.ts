import { globSync } from 'glob';

import type {
  GenerationPlatform,
  RulesGenerationPlatform,
  Typesync,
  TypesyncGenerateOptions,
  TypesyncGenerateResult,
  TypesyncGenerateRulesOptions,
  TypesyncGenerateRulesResult,
  TypesyncValidateOptions,
  TypesyncValidateResult,
} from '../api.js';
import { DefinitionFilesNotFoundError } from '../errors/invalid-def.js';
import {
  InvalidCustomPydanticBaseOption,
  InvalidIndentationOption,
  InvalidValidatorNamePatternOption,
  InvalidValidatorParamNameOption,
} from '../errors/invalid-opts.js';
import { type Generator } from '../generators/index.js';
import { createPythonGenerator } from '../generators/python/index.js';
import { createRulesGenerator } from '../generators/rules/index.js';
import { createSwiftGenerator } from '../generators/swift/index.js';
import { createTSGenerator } from '../generators/ts/index.js';
import { renderers } from '../renderers/index.js';
import { schema } from '../schema/index.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { writeFile } from '../util/fs.js';
import { parsePythonClassImportPath } from '../util/parse-python-class-import-path.js';
import { createDefinitionParser } from './definition-parser.js';
import { createLogger } from './logger.js';

interface NormalizedGenerateOptions {
  definitionGlobPattern: string;
  platform: GenerationPlatform;
  pathToOutputFile: string;
  indentation: number;
  customPydanticBase?: {
    importPath: string;
    className: string;
  };
  debug: boolean;
}

interface NormalizedGenerateRulesOptions {
  definitionGlobPattern: string;
  platform: RulesGenerationPlatform;
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
  validatorNamePattern: string;
  validatorParamName: string;
  indentation: number;
  debug: boolean;
}

class TypesyncImpl implements Typesync {
  public async generate(rawOpts: TypesyncGenerateOptions): Promise<TypesyncGenerateResult> {
    const opts = this.validateAndNormalizeOpts(rawOpts);

    const { definitionGlobPattern, pathToOutputFile, debug } = opts;

    const logger = createLogger(debug);
    const generator = this.createGenerator(opts);
    const renderer = this.createRenderer(opts);
    const parser = createDefinitionParser(logger);

    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);
    logger.info(`Found ${definitionFilePaths.length} definition files matching Glob pattern:`, definitionFilePaths);

    const definition = parser.parseDefinition(definitionFilePaths);
    const s = schema.createFromDefinition(definition);
    const generation = generator.generate(s);
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);

    return {
      aliasModelCount: s.aliasModels.length,
      documentModelCount: s.documentModels.length,
    };
  }

  public async generateRules(rawOpts: TypesyncGenerateRulesOptions): Promise<TypesyncGenerateRulesResult> {
    const opts = this.validateAndNormalizeRulesOpts(rawOpts);

    const {
      definitionGlobPattern,
      platform,
      pathToOutputFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      indentation,
      debug,
    } = opts;

    const logger = createLogger(debug);
    const generator = createRulesGenerator({
      platform,
    });
    const renderer = renderers.createRulesRenderer({
      indentation,
      pathToOutputFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      platform,
    });
    const parser = createDefinitionParser(logger);

    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);
    logger.info(`Found ${definitionFilePaths.length} definition files matching Glob pattern:`, definitionFilePaths);

    const definition = parser.parseDefinition(definitionFilePaths);
    const s = schema.createFromDefinition(definition);
    const generation = generator.generate(s);
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);

    return {
      aliasModelCount: s.aliasModels.length,
      documentModelCount: s.documentModels.length,
    };
  }

  private validateAndNormalizeOpts(opts: TypesyncGenerateOptions): NormalizedGenerateOptions {
    const { definition, platform, outFile, indentation, customPydanticBase: customPydanticBaseRaw, debug } = opts;

    let customPydanticBase;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidIndentationOption(indentation);
    }
    if (typeof customPydanticBaseRaw === 'string') {
      try {
        customPydanticBase = parsePythonClassImportPath(customPydanticBaseRaw);
      } catch {
        throw new InvalidCustomPydanticBaseOption(customPydanticBaseRaw);
      }
    }

    return {
      definitionGlobPattern: definition,
      platform,
      pathToOutputFile: outFile,
      indentation,
      customPydanticBase,
      debug,
    };
  }

  private validateAndNormalizeRulesOpts(opts: TypesyncGenerateRulesOptions): NormalizedGenerateRulesOptions {
    const {
      definition,
      platform,
      outFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      indentation,
      debug,
    } = opts;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidIndentationOption(indentation);
    }

    if (!validatorNamePattern.includes('{modelName}')) {
      throw new InvalidValidatorNamePatternOption(validatorNamePattern);
    }

    if (validatorParamName.length === 0) {
      throw new InvalidValidatorParamNameOption(validatorParamName);
    }

    return {
      definitionGlobPattern: definition,
      platform,
      pathToOutputFile: outFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      indentation,
      debug,
    };
  }

  public async validate(opts: TypesyncValidateOptions): Promise<TypesyncValidateResult> {
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

  private createGenerator(opts: NormalizedGenerateOptions): Generator {
    const { platform } = opts;
    switch (platform) {
      case 'ts:firebase-admin:12':
      case 'ts:firebase-admin:11':
      case 'ts:firebase:10':
      case 'ts:firebase:9':
        return createTSGenerator({ platform });
      case 'swift:firebase:10':
        return createSwiftGenerator({ platform });
      case 'py:firebase-admin:6':
        return createPythonGenerator({ platform });
      default:
        assertNever(platform);
    }
  }

  private createRenderer(opts: NormalizedGenerateOptions): renderers.Renderer {
    const { platform, indentation, customPydanticBase } = opts;
    switch (platform) {
      case 'ts:firebase-admin:12':
      case 'ts:firebase-admin:11':
      case 'ts:firebase:10':
      case 'ts:firebase:9':
        return renderers.createTSRenderer({
          platform,
          indentation,
        });
      case 'swift:firebase:10':
        return renderers.createSwiftRenderer({
          platform,
          indentation,
        });
      case 'py:firebase-admin:6':
        return renderers.createPythonRenderer({
          platform,
          indentation,
          customPydanticBase,
        });
      default:
        assertNever(platform);
    }
  }
}

export function createTypesync(): Typesync {
  return new TypesyncImpl();
}
