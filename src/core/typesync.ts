import { globSync } from 'glob';

import type {
  GeneratePythonOptions,
  GeneratePythonRepresentationOptions,
  GeneratePythonRepresentationResult,
  GeneratePythonResult,
  GenerateRulesOptions,
  GenerateRulesRepresentationOptions,
  GenerateRulesRepresentationResult,
  GenerateRulesResult,
  GenerateSwiftOptions,
  GenerateSwiftRepresentationOptions,
  GenerateSwiftRepresentationResult,
  GenerateSwiftResult,
  GenerateTsOptions,
  GenerateTsRepresentationOptions,
  GenerateTsRepresentationResult,
  GenerateTsResult,
  PythonGenerationTarget,
  SwiftGenerationTarget,
  TSGenerationTarget,
  Typesync,
  ValidateOptions,
  ValidateResult,
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
  DEFAULT_VALIDATE_DEBUG,
  RULES_VALIDATOR_NAME_PATTERN_PARAM,
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
  debug: boolean;
}

interface NormalizedGenerateRulesOptions extends NormalizedGenerateRulesRepresentationOptions {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
  validatorNamePattern: string;
  validatorParamName: string;
  indentation: number;
}

class TypesyncImpl implements Typesync {
  public async generateTs(rawOpts: GenerateTsOptions): Promise<GenerateTsResult> {
    const opts = this.normalizeGenerateTsOpts(rawOpts);
    const { schema: s, generation } = await this.generateTsRepresentation(rawOpts);
    const renderer = renderers.createTSRenderer(opts);
    const file = await renderer.render(generation);
    await writeFile(opts.pathToOutputFile, file.content);
    return { type: 'ts', schema: s, generation };
  }

  public async generateTsRepresentation(
    rawOpts: GenerateTsRepresentationOptions
  ): Promise<GenerateTsRepresentationResult> {
    const opts = this.normalizeGenerateTsRepresentationOpts(rawOpts);
    const { definitionGlobPattern, target, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createTSGenerator({ target });
    const generation = generator.generate(s);
    return { type: 'ts', schema: s, generation };
  }

  private normalizeGenerateTsOpts(opts: GenerateTsOptions): NormalizedGenerateTsOptions {
    const { outFile, indentation = DEFAULT_TS_INDENTATION, ...rest } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidTSIndentationOption(indentation);
    }
    return { ...this.normalizeGenerateTsRepresentationOpts(rest), pathToOutputFile: outFile, indentation };
  }

  private normalizeGenerateTsRepresentationOpts(
    opts: GenerateTsRepresentationOptions
  ): NormalizedGenerateTsRepresentationOptions {
    const { definition, target, debug = DEFAULT_TS_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      target,
      debug,
    };
  }

  public async generateSwift(rawOpts: GenerateSwiftOptions): Promise<GenerateSwiftResult> {
    const opts = this.normalizeGenerateSwiftOpts(rawOpts);
    const { schema: s, generation } = await this.generateSwiftRepresentation(rawOpts);
    const renderer = renderers.createSwiftRenderer(opts);
    const file = await renderer.render(generation);
    await writeFile(opts.pathToOutputFile, file.content);
    return { type: 'swift', schema: s, generation };
  }

  public async generateSwiftRepresentation(
    rawOpts: GenerateSwiftRepresentationOptions
  ): Promise<GenerateSwiftRepresentationResult> {
    const opts = this.normalizeGenerateSwiftRepresentationOpts(rawOpts);
    const { definitionGlobPattern, target, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createSwiftGenerator({ target });
    const generation = generator.generate(s);
    return { type: 'swift', schema: s, generation };
  }

  private normalizeGenerateSwiftOpts(opts: GenerateSwiftOptions): NormalizedGenerateSwiftOptions {
    const { outFile, indentation = DEFAULT_SWIFT_INDENTATION, ...rest } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidSwiftIndentationOption(indentation);
    }
    return { ...this.normalizeGenerateSwiftRepresentationOpts(rest), pathToOutputFile: outFile, indentation };
  }

  private normalizeGenerateSwiftRepresentationOpts(
    opts: GenerateSwiftRepresentationOptions
  ): NormalizedGenerateSwiftRepresentationOptions {
    const { definition, target, debug = DEFAULT_SWIFT_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      target,
      debug,
    };
  }

  public async generatePy(rawOpts: GeneratePythonOptions): Promise<GeneratePythonResult> {
    const opts = this.normalizeGeneratePyOpts(rawOpts);
    const { schema: s, generation } = await this.generatePyRepresentation(rawOpts);
    const renderer = renderers.createPythonRenderer(opts);
    const file = await renderer.render(generation);
    await writeFile(opts.pathToOutputFile, file.content);
    return { type: 'python', schema: s, generation };
  }

  public async generatePyRepresentation(
    rawOpts: GeneratePythonRepresentationOptions
  ): Promise<GeneratePythonRepresentationResult> {
    const opts = this.normalizeGeneratePyRepresentationOpts(rawOpts);
    const { definitionGlobPattern, target, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createPythonGenerator({ target });
    const generation = generator.generate(s);
    return { type: 'python', schema: s, generation };
  }

  private normalizeGeneratePyOpts(opts: GeneratePythonOptions): NormalizedGeneratePythonOptions {
    const {
      outFile,
      customPydanticBase: customPydanticBaseRaw = DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
      indentation = DEFAULT_PY_INDENTATION,
      ...rest
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
      ...this.normalizeGeneratePyRepresentationOpts(rest),
      pathToOutputFile: outFile,
      customPydanticBase,
      indentation,
    };
  }

  private normalizeGeneratePyRepresentationOpts(
    opts: GeneratePythonRepresentationOptions
  ): NormalizedGeneratePythonRepresentationOptions {
    const { definition, target, debug = DEFAULT_PY_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      target,
      debug,
    };
  }

  public async generateRules(rawOpts: GenerateRulesOptions): Promise<GenerateRulesResult> {
    const opts = this.normalizeGenerateRulesOpts(rawOpts);
    const { schema: s, generation } = await this.generateRulesRepresentation(rawOpts);
    const renderer = renderers.createRulesRenderer(opts);
    const file = await renderer.render(generation);
    await writeFile(opts.pathToOutputFile, file.content);
    return { type: 'rules', schema: s, generation };
  }

  public async generateRulesRepresentation(
    rawOpts: GenerateRulesRepresentationOptions
  ): Promise<GenerateRulesRepresentationResult> {
    const opts = this.normalizeGenerateRulesRepresentationOpts(rawOpts);
    const { definitionGlobPattern, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createRulesGenerator({});
    const generation = generator.generate(s);
    return { type: 'rules', schema: s, generation };
  }

  private normalizeGenerateRulesOpts(opts: GenerateRulesOptions): NormalizedGenerateRulesOptions {
    const {
      outFile,
      startMarker = DEFAULT_RULES_START_MARKER,
      endMarker = DEFAULT_RULES_END_MARKER,
      validatorNamePattern = DEFAULT_RULES_VALIDATOR_NAME_PATTERN,
      validatorParamName = DEFAULT_RULES_VALIDATOR_PARAM_NAME,
      indentation = DEFAULT_RULES_INDENTATION,
      ...rest
    } = opts;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidRulesIndentationOption(indentation);
    }

    if (!validatorNamePattern.includes(RULES_VALIDATOR_NAME_PATTERN_PARAM)) {
      throw new InvalidValidatorNamePatternOption(validatorNamePattern);
    }

    if (validatorParamName.length === 0) {
      throw new InvalidValidatorParamNameOption(validatorParamName);
    }

    return {
      ...this.normalizeGenerateRulesRepresentationOpts(rest),
      pathToOutputFile: outFile,
      startMarker,
      endMarker,
      validatorNamePattern,
      validatorParamName,
      indentation,
    };
  }

  private normalizeGenerateRulesRepresentationOpts(
    opts: GenerateRulesRepresentationOptions
  ): NormalizedGenerateRulesRepresentationOptions {
    const { definition, debug = DEFAULT_RULES_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      debug,
    };
  }

  public async validate(opts: ValidateOptions): Promise<ValidateResult> {
    const { definition: definitionGlobPattern, debug = DEFAULT_VALIDATE_DEBUG } = opts;
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
    return { logger, schema: schema.createSchemaFromDefinition(definition) };
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
