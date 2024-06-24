import { globSync } from 'glob';

import type {
  GenerateGraphOptions,
  GenerateGraphRepresentationOptions,
  GenerateGraphRepresentationResult,
  GenerateGraphResult,
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
  SchemaGraphOrientation,
  SwiftGenerationTarget,
  TSGenerationTarget,
  TSObjectTypeFormat,
  Typesync,
  ValidateOptions,
  ValidateResult,
} from '../api/index.js';
import { GenerateRepresentationOptions, GenerateRepresentationResult } from '../api/typesync.js';
import {
  DEFAULT_GRAPH_DEBUG,
  DEFAULT_GRAPH_END_MARKER,
  DEFAULT_GRAPH_ORIENTATION,
  DEFAULT_GRAPH_START_MARKER,
  DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
  DEFAULT_PY_DEBUG,
  DEFAULT_PY_INDENTATION,
  DEFAULT_PY_UNDEFINED_SENTINEL_NAME,
  DEFAULT_RULES_DEBUG,
  DEFAULT_RULES_END_MARKER,
  DEFAULT_RULES_INDENTATION,
  DEFAULT_RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN,
  DEFAULT_RULES_READONLY_FIELD_VALIDATOR_NEXT_DATA_PARAM_NAME,
  DEFAULT_RULES_READONLY_FIELD_VALIDATOR_PREV_DATA_PARAM_NAME,
  DEFAULT_RULES_START_MARKER,
  DEFAULT_RULES_TYPE_VALIDATOR_NAME_PATTERN,
  DEFAULT_RULES_TYPE_VALIDATOR_PARAM_NAME,
  DEFAULT_SWIFT_DEBUG,
  DEFAULT_SWIFT_INDENTATION,
  DEFAULT_TS_DEBUG,
  DEFAULT_TS_INDENTATION,
  DEFAULT_VALIDATE_DEBUG,
  RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM,
  RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM,
} from '../constants.js';
import { DefinitionFilesNotFoundError } from '../errors/invalid-def.js';
import {
  GraphMarkerOptionsNotDistinctError,
  InvalidCustomPydanticBaseOptionError,
  InvalidGraphEndMarkerOptionError,
  InvalidGraphStartMarkerOptionError,
  InvalidPyIndentationOptionError,
  InvalidReadonlyFieldValidatorNamePatternOptionError,
  InvalidReadonlyFieldValidatorNextDataParamNameOptionError,
  InvalidReadonlyFieldValidatorPrevDataParamNameOptionError,
  InvalidRulesEndMarkerOptionError,
  InvalidRulesIndentationOptionError,
  InvalidRulesStartMarkerOptionError,
  InvalidSwiftIndentationOptionError,
  InvalidTSIndentationOptionError,
  InvalidTypeValidatorNamePatternOptionError,
  InvalidTypeValidatorParamNameOptionError,
  InvalidUndefinedSentinelNameOptionError,
  RulesMarkerOptionsNotDistinctError,
  ValidatorNamePatternsNotDistinctError,
} from '../errors/invalid-opts.js';
import { createGraphGenerator } from '../generators/graph/index.js';
import { createPythonGenerator } from '../generators/python/index.js';
import { createRulesGenerator } from '../generators/rules/index.js';
import { createSwiftGenerator } from '../generators/swift/index.js';
import { createTSGenerator } from '../generators/ts/index.js';
import { renderers } from '../renderers/index.js';
import { createSchemaGraphFromSchema } from '../schema-graph/create-from-schema.js';
import { schema } from '../schema/index.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { writeFile } from '../util/fs.js';
import { parsePythonClassImportPath } from '../util/parse-python-class-import-path.js';
import { createDefinitionParser } from './definition-parser/index.js';
import { createLogger } from './logger/index.js';

interface NormalizedGenerateTsRepresentationOptions {
  definitionGlobPattern: string;
  target: TSGenerationTarget;
  objectTypeFormat: TSObjectTypeFormat;
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
  undefinedSentinelName: string;
  indentation: number;
}

interface NormalizedGenerateRulesRepresentationOptions {
  definitionGlobPattern: string;
  typeValidatorNamePattern: string;
  typeValidatorParamName: string;
  readonlyFieldValidatorNamePattern: string;
  readonlyFieldValidatorPrevDataParamName: string;
  readonlyFieldValidatorNextDataParamName: string;
  debug: boolean;
}

interface NormalizedGenerateRulesOptions extends NormalizedGenerateRulesRepresentationOptions {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
  indentation: number;
}

interface NormalizedGenerateGraphRepresentationOptions {
  definitionGlobPattern: string;
  orientation: SchemaGraphOrientation;
  debug: boolean;
}

interface NormalizedGenerateGraphOptions extends NormalizedGenerateGraphRepresentationOptions {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
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
    const { definitionGlobPattern, target, objectTypeFormat, debug } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createTSGenerator({ target, objectTypeFormat });
    const generation = generator.generate(s);
    return { type: 'ts', schema: s, generation };
  }

  private normalizeGenerateTsOpts(opts: GenerateTsOptions): NormalizedGenerateTsOptions {
    const { outFile, indentation = DEFAULT_TS_INDENTATION, ...rest } = opts;
    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidTSIndentationOptionError(indentation);
    }
    return {
      ...this.normalizeGenerateTsRepresentationOpts(rest),
      pathToOutputFile: outFile,
      indentation,
    };
  }

  private normalizeGenerateTsRepresentationOpts(
    opts: GenerateTsRepresentationOptions
  ): NormalizedGenerateTsRepresentationOptions {
    const { definition, target, objectTypeFormat, debug = DEFAULT_TS_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      target,
      objectTypeFormat,
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
      throw new InvalidSwiftIndentationOptionError(indentation);
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
      undefinedSentinelName = DEFAULT_PY_UNDEFINED_SENTINEL_NAME,
      indentation = DEFAULT_PY_INDENTATION,
      ...rest
    } = opts;

    let customPydanticBase;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidPyIndentationOptionError(indentation);
    }
    if (typeof customPydanticBaseRaw === 'string') {
      try {
        customPydanticBase = parsePythonClassImportPath(customPydanticBaseRaw);
      } catch {
        throw new InvalidCustomPydanticBaseOptionError(customPydanticBaseRaw);
      }
    }
    if (undefinedSentinelName.length === 0) {
      throw new InvalidUndefinedSentinelNameOptionError();
    }

    return {
      ...this.normalizeGeneratePyRepresentationOpts(rest),
      pathToOutputFile: outFile,
      customPydanticBase,
      undefinedSentinelName,
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
    const {
      definitionGlobPattern,
      typeValidatorNamePattern,
      typeValidatorParamName,
      readonlyFieldValidatorNamePattern,
      readonlyFieldValidatorPrevDataParamName,
      readonlyFieldValidatorNextDataParamName,
      debug,
    } = opts;
    const { schema: s } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createRulesGenerator({
      typeValidatorNamePattern,
      typeValidatorParamName,
      readonlyFieldValidatorNamePattern,
      readonlyFieldValidatorPrevDataParamName,
      readonlyFieldValidatorNextDataParamName,
    });
    const generation = generator.generate(s);
    return { type: 'rules', schema: s, generation };
  }

  private normalizeGenerateRulesOpts(opts: GenerateRulesOptions): NormalizedGenerateRulesOptions {
    const {
      outFile,
      startMarker = DEFAULT_RULES_START_MARKER,
      endMarker = DEFAULT_RULES_END_MARKER,
      indentation = DEFAULT_RULES_INDENTATION,
      ...rest
    } = opts;

    if (!Number.isSafeInteger(indentation) || indentation < 1) {
      throw new InvalidRulesIndentationOptionError(indentation);
    }

    if (startMarker.length === 0) {
      throw new InvalidRulesStartMarkerOptionError();
    }

    if (endMarker.length === 0) {
      throw new InvalidRulesEndMarkerOptionError();
    }

    if (startMarker === endMarker) {
      throw new RulesMarkerOptionsNotDistinctError(startMarker);
    }

    return {
      ...this.normalizeGenerateRulesRepresentationOpts(rest),
      pathToOutputFile: outFile,
      startMarker,
      endMarker,
      indentation,
    };
  }

  private normalizeGenerateRulesRepresentationOpts(
    opts: GenerateRulesRepresentationOptions
  ): NormalizedGenerateRulesRepresentationOptions {
    const {
      definition,
      typeValidatorNamePattern = DEFAULT_RULES_TYPE_VALIDATOR_NAME_PATTERN,
      typeValidatorParamName = DEFAULT_RULES_TYPE_VALIDATOR_PARAM_NAME,
      readonlyFieldValidatorNamePattern = DEFAULT_RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN,
      readonlyFieldValidatorPrevDataParamName = DEFAULT_RULES_READONLY_FIELD_VALIDATOR_PREV_DATA_PARAM_NAME,
      readonlyFieldValidatorNextDataParamName = DEFAULT_RULES_READONLY_FIELD_VALIDATOR_NEXT_DATA_PARAM_NAME,
      debug = DEFAULT_RULES_DEBUG,
    } = opts;

    if (!typeValidatorNamePattern.includes(RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM)) {
      throw new InvalidTypeValidatorNamePatternOptionError(typeValidatorNamePattern);
    }

    if (typeValidatorParamName.length === 0) {
      throw new InvalidTypeValidatorParamNameOptionError(typeValidatorParamName);
    }

    if (!readonlyFieldValidatorNamePattern.includes(RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM)) {
      throw new InvalidReadonlyFieldValidatorNamePatternOptionError(readonlyFieldValidatorNamePattern);
    }

    if (readonlyFieldValidatorPrevDataParamName.length === 0) {
      throw new InvalidReadonlyFieldValidatorPrevDataParamNameOptionError(readonlyFieldValidatorPrevDataParamName);
    }

    if (readonlyFieldValidatorNextDataParamName.length === 0) {
      throw new InvalidReadonlyFieldValidatorNextDataParamNameOptionError(readonlyFieldValidatorNextDataParamName);
    }

    if (typeValidatorNamePattern === readonlyFieldValidatorNamePattern) {
      throw new ValidatorNamePatternsNotDistinctError(typeValidatorNamePattern);
    }

    return {
      definitionGlobPattern: definition,
      typeValidatorNamePattern,
      typeValidatorParamName,
      readonlyFieldValidatorNamePattern,
      readonlyFieldValidatorPrevDataParamName,
      readonlyFieldValidatorNextDataParamName,
      debug,
    };
  }

  public async generateGraph(rawOpts: GenerateGraphOptions): Promise<GenerateGraphResult> {
    const opts = this.normalizeGenerateGraphOpts(rawOpts);
    const { schema: s, generation } = await this.generateGraphRepresentation(rawOpts);
    const renderer = renderers.createGraphRenderer(opts);
    const file = await renderer.render(generation);
    await writeFile(opts.pathToOutputFile, file.content);
    return { type: 'graph', schema: s, generation };
  }

  public async generateGraphRepresentation(
    rawOpts: GenerateGraphRepresentationOptions
  ): Promise<GenerateGraphRepresentationResult> {
    const opts = this.normalizeGenerateGraphRepresentationOpts(rawOpts);
    const { definitionGlobPattern, orientation, debug } = opts;
    const { schema: s, graph } = this.createCoreObjects(definitionGlobPattern, debug);
    const generator = createGraphGenerator({ orientation });
    const generation = generator.generate(graph);
    return { type: 'graph', schema: s, generation };
  }

  private normalizeGenerateGraphOpts(opts: GenerateGraphOptions): NormalizedGenerateGraphOptions {
    const { outFile, startMarker = DEFAULT_GRAPH_START_MARKER, endMarker = DEFAULT_GRAPH_END_MARKER, ...rest } = opts;

    if (startMarker.length === 0) {
      throw new InvalidGraphStartMarkerOptionError();
    }

    if (endMarker.length === 0) {
      throw new InvalidGraphEndMarkerOptionError();
    }

    if (startMarker === endMarker) {
      throw new GraphMarkerOptionsNotDistinctError(startMarker);
    }

    return {
      ...this.normalizeGenerateGraphRepresentationOpts(rest),
      pathToOutputFile: outFile,
      startMarker,
      endMarker,
    };
  }

  private normalizeGenerateGraphRepresentationOpts(
    opts: GenerateGraphRepresentationOptions
  ): NormalizedGenerateGraphRepresentationOptions {
    const { definition, orientation = DEFAULT_GRAPH_ORIENTATION, debug = DEFAULT_GRAPH_DEBUG } = opts;
    return {
      definitionGlobPattern: definition,
      orientation,
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

  public generateRepresentation(opts: GenerateRepresentationOptions): GenerateRepresentationResult {
    const { definition: definitionGlobPattern } = opts;
    const { definition, schema: s } = this.createCoreObjects(definitionGlobPattern, false);
    return { definition, schema: s };
  }

  private createCoreObjects(definitionGlobPattern: string, debug: boolean) {
    const logger = createLogger(debug);
    const parser = createDefinitionParser(logger);
    const definitionFilePaths = this.findDefinitionFilesMatchingPattern(definitionGlobPattern);
    logger.info(`Found ${definitionFilePaths.length} definition files matching Glob pattern:`, definitionFilePaths);
    const definition = parser.parseDefinition(definitionFilePaths);
    const s = schema.createSchemaFromDefinition(definition);
    const graph = createSchemaGraphFromSchema(s);
    return { logger, definition, schema: s, graph };
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
