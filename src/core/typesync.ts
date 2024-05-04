import { globSync } from 'glob';

import type {
  PythonGenerationTarget,
  SwiftGenerationTarget,
  TSGenerationTarget,
  Typesync,
  TypesyncGeneratePythonOptions,
  TypesyncGeneratePythonResult,
  TypesyncGenerateRulesOptions,
  TypesyncGenerateRulesResult,
  TypesyncGenerateSwiftOptions,
  TypesyncGenerateSwiftResult,
  TypesyncGenerateTsOptions,
  TypesyncGenerateTsRepresentationOptions,
  TypesyncGenerateTsResult,
  TypesyncValidateOptions,
  TypesyncValidateResult,
} from '../api/index.js';
import {
  DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
  DEFAULT_PY_DEBUG,
  DEFAULT_PY_INDENTATION,
  DEFAULT_RULES_DEBUG,
  DEFAULT_RULES_END_MARKER,
  DEFAULT_RULES_INDENTATION,
  DEFAULT_RULES_START_MARKER,
  DEFAULT_RULES_VALIDATOR_NAME_PATTERN,
  DEFAULT_RULES_VALIDATOR_PARAM_NAME,
  DEFAULT_SWIFT_DEBUG,
  DEFAULT_SWIFT_INDENTATION,
  DEFAULT_TS_DEBUG,
  DEFAULT_TS_INDENTATION,
} from '../constants.js';
import { DefinitionFilesNotFoundError } from '../errors/invalid-def.js';
import {
  InvalidCustomPydanticBaseOption,
  InvalidPyIndentationOption,
  InvalidRulesIndentationOption,
  InvalidSwiftIndentationOption,
  InvalidTSIndentationOption,
  InvalidValidatorNamePatternOption,
  InvalidValidatorParamNameOption,
} from '../errors/invalid-opts.js';
import { createPythonGenerator } from '../generators/python/index.js';
import { createRulesGenerator } from '../generators/rules/index.js';
import { createSwiftGenerator } from '../generators/swift/index.js';
import { createTSGenerator } from '../generators/ts/index.js';
import { renderers } from '../renderers/index.js';
import { schema } from '../schema/index.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { writeFile } from '../util/fs.js';
import { parsePythonClassImportPath } from '../util/parse-python-class-import-path.js';
import { createDefinitionParser } from './definition-parser.js';
import { createLogger } from './logger.js';

interface NormalizedGenerateTsRepresentationOptions {
  definitionGlobPattern: string;
  target: TSGenerationTarget;
  debug: boolean;
}

interface NormalizedGenerateTsOptions extends NormalizedGenerateTsRepresentationOptions {
  pathToOutputFile: string;
  indentation: number;
}

interface NormalizedGenerateSwiftRepresentationOptions {
  definitionGlobPattern: string;
  target: SwiftGenerationTarget;
  debug: boolean;
}

interface NormalizedGenerateSwiftOptions extends NormalizedGenerateSwiftRepresentationOptions {
  pathToOutputFile: string;
  indentation: number;
}

interface NormalizedGeneratePythonRepresentationOptions {
  definitionGlobPattern: string;
  target: PythonGenerationTarget;
  debug: boolean;
}

interface NormalizedGeneratePythonOptions extends NormalizedGeneratePythonRepresentationOptions {
  pathToOutputFile: string;
  customPydanticBase?: {
    importPath: string;
    className: string;
  };
  indentation: number;
}

interface NormalizedGenerateRulesRepresentationOptions {
  definitionGlobPattern: string;
  startMarker: string;
  endMarker: string;
  debug: boolean;
}

interface NormalizedGenerateRulesOptions extends NormalizedGenerateRulesRepresentationOptions {
  pathToOutputFile: string;
  validatorNamePattern: string;
  validatorParamName: string;
  indentation: number;
}

class TypesyncImpl implements Typesync {
  public async generateTs(rawOpts: TypesyncGenerateTsOptions): Promise<TypesyncGenerateTsResult> {
    const opts = this.normalizeGenerateTsOpts(rawOpts);
    const { target, pathToOutputFile, indentation } = opts;
    const { schema: s, generation } = await this.generateTsRepresentation(rawOpts);
    const renderer = renderers.createTSRenderer({ target, indentation });
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);
    return { type: 'ts', schema: s, generation };
  }

  public async generateTsRepresentation(
    rawOpts: TypesyncGenerateTsRepresentationOptions
  ): Promise<TypesyncGenerateTsResult> {
    const opts = this.normalizeGenerateTsRepresentationOpts(rawOpts);
    const { definitionGlobPattern, target, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createTSGenerator({ target });
    const generation = generator.generate(s);
    return { type: 'ts', schema: s, generation };
  }

  private normalizeGenerateTsOpts(opts: TypesyncGenerateTsOptions): NormalizedGenerateTsOptions {
    const { outFile, indentation = DEFAULT_TS_INDENTATION, ...rest } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidTSIndentationOption(indentation);
    }
    return { ...this.normalizeGenerateTsRepresentationOpts(rest), pathToOutputFile: outFile, indentation };
  }

  private normalizeGenerateTsRepresentationOpts(
    opts: TypesyncGenerateTsRepresentationOptions
  ): NormalizedGenerateTsRepresentationOptions {
    const { definition, target, debug = DEFAULT_TS_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      target,
      debug,
    };
  }

  public async generateSwift(rawOpts: TypesyncGenerateSwiftOptions): Promise<TypesyncGenerateSwiftResult> {
    const opts = this.validateAndNormalizeSwiftOpts(rawOpts);
    const { definitionGlobPattern, pathToOutputFile, target, indentation, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createSwiftGenerator({ target });
    const renderer = renderers.createSwiftRenderer({ target, indentation });
    const generation = generator.generate(s);
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);
    return {
      type: 'swift',
      schema: s,
    };
  }

  private validateAndNormalizeSwiftOpts(opts: TypesyncGenerateSwiftOptions): NormalizedGenerateSwiftOptions {
    const { definition, target, outFile, indentation = DEFAULT_SWIFT_INDENTATION, debug = DEFAULT_SWIFT_DEBUG } = opts;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidSwiftIndentationOption(indentation);
    }

    return {
      definitionGlobPattern: definition,
      target,
      pathToOutputFile: outFile,
      indentation,
      debug,
    };
  }

  public async generatePy(rawOpts: TypesyncGeneratePythonOptions): Promise<TypesyncGeneratePythonResult> {
    const opts = this.validateAndNormalizePyOpts(rawOpts);
    const { definitionGlobPattern, pathToOutputFile, target, customPydanticBase, indentation, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createPythonGenerator({ target });
    const renderer = renderers.createPythonRenderer({
      target,
      customPydanticBase,
      indentation,
    });
    const generation = generator.generate(s);
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);
    return {
      type: 'python',
      schema: s,
    };
  }

  private validateAndNormalizePyOpts(opts: TypesyncGeneratePythonOptions): NormalizedGeneratePythonOptions {
    const {
      definition,
      target,
      outFile,
      indentation = DEFAULT_PY_INDENTATION,
      customPydanticBase: customPydanticBaseRaw = DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
      debug = DEFAULT_PY_DEBUG,
    } = opts;

    let customPydanticBase;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidPyIndentationOption(indentation);
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
      target,
      pathToOutputFile: outFile,
      indentation,
      customPydanticBase,
      debug,
    };
  }

  public async generateRules(rawOpts: TypesyncGenerateRulesOptions): Promise<TypesyncGenerateRulesResult> {
    const opts = this.validateAndNormalizeRulesOpts(rawOpts);
    const {
      definitionGlobPattern,
      pathToOutputFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      indentation,
      debug,
    } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createRulesGenerator({});
    const renderer = renderers.createRulesRenderer({
      indentation,
      pathToOutputFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
    });
    const generation = generator.generate(s);
    const file = await renderer.render(generation);
    await writeFile(pathToOutputFile, file.content);
    return {
      type: 'rules',
      schema: s,
    };
  }

  private validateAndNormalizeRulesOpts(opts: TypesyncGenerateRulesOptions): NormalizedGenerateRulesOptions {
    const {
      definition,
      outFile,
      startMarker = DEFAULT_RULES_START_MARKER,
      endMarker = DEFAULT_RULES_END_MARKER,
      validatorNamePattern = DEFAULT_RULES_VALIDATOR_NAME_PATTERN,
      validatorParamName = DEFAULT_RULES_VALIDATOR_PARAM_NAME,
      indentation = DEFAULT_RULES_INDENTATION,
      debug = DEFAULT_RULES_DEBUG,
    } = opts;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidRulesIndentationOption(indentation);
    }

    if (!validatorNamePattern.includes('{modelName}')) {
      throw new InvalidValidatorNamePatternOption(validatorNamePattern);
    }

    if (validatorParamName.length === 0) {
      throw new InvalidValidatorParamNameOption(validatorParamName);
    }

    return {
      definitionGlobPattern: definition,
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
    const { definition: definitionGlobPattern, debug } = opts;
    try {
      this.createCoreObjects(definitionGlobPattern, debug);
      return { success: true };
    } catch (e) {
      return { success: false, message: extractErrorMessage(e) };
    }
  }

  private createCoreObjects(definitionGlobPattern: string, debug: boolean) {
    const logger = createLogger(debug);
    const parser = createDefinitionParser(logger);
    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);
    logger.info(`Found ${definitionFilePaths.length} definition files matching Glob pattern:`, definitionFilePaths);
    const definition = parser.parseDefinition(definitionFilePaths);
    return { logger, schema: schema.createFromDefinition(definition) };
  }

  private findDefinitionFilesMatchingPattern(globPattern: string) {
    const filePaths = globSync(globPattern);
    if (filePaths.length === 0) {
      throw new DefinitionFilesNotFoundError(globPattern);
    }
    return filePaths as [string, ...string[]];
  }
}

export function createTypesync(): Typesync {
  return new TypesyncImpl();
}
