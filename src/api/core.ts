import { createTypesync } from '../core/typesync.js';
import type {
  GeneratePythonOptions,
  GeneratePythonRepresentationOptions,
  GeneratePythonRepresentationResult,
  GeneratePythonResult,
} from './python.js';
import type { GenerateRulesOptions, GenerateRulesResult } from './rules.js';
import type { GenerateSwiftOptions, GenerateSwiftResult } from './swift.js';
import type { GenerateTsOptions, GenerateTsRepresentationOptions, GenerateTsResult } from './ts.js';

export interface ValidateOptions {
  definition: string;
  debug: boolean;
}

export type ValidateResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export interface Typesync {
  /**
   * Generates TypeScript type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-ts` command.
   */
  generateTs(opts: GenerateTsOptions): Promise<GenerateTsResult>;

  /**
   * Generates TypeScript type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generateTsRepresentation(opts: GenerateTsRepresentationOptions): Promise<GenerateTsResult>;

  /**
   * Generates Swift type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-swift` command.
   */
  generateSwift(opts: GenerateSwiftOptions): Promise<GenerateSwiftResult>;

  /**
   * Generates Swift type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generateSwiftRepresentation(opts: GenerateSwiftOptions): Promise<GenerateSwiftResult>;

  /**
   * Generates Python/Pydantic type definitions for the specified schema and writes them to the specified file.
   *
   * @remarks
   *
   * This is the programmatic API for the `typesync generate-py` command.
   */
  generatePy(opts: GeneratePythonOptions): Promise<GeneratePythonResult>;

  /**
   * Generates Python/Pydantic type definitions for the specified schema and returns the generation and the internal representation of the schema without writing anything to the filesystem.
   */
  generatePyRepresentation(opts: GeneratePythonRepresentationOptions): Promise<GeneratePythonRepresentationResult>;

  generateRules(opts: GenerateRulesOptions): Promise<GenerateRulesResult>;

  validate(opts: ValidateOptions): Promise<ValidateResult>;
}

export type GenerateResult = GenerateTsResult | GenerateSwiftResult | GeneratePythonResult | GenerateRulesResult;

/**
 * The programmatic interface for the Typesync CLI.
 */
export const typesync = createTypesync();
