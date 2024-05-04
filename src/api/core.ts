import { createTypesync } from '../core/typesync.js';
import type { TypesyncGeneratePythonOptions, TypesyncGeneratePythonResult } from './python.js';
import type { TypesyncGenerateRulesOptions, TypesyncGenerateRulesResult } from './rules.js';
import type { TypesyncGenerateSwiftOptions, TypesyncGenerateSwiftResult } from './swift.js';
import type {
  TypesyncGenerateTsOptions,
  TypesyncGenerateTsRepresentationOptions,
  TypesyncGenerateTsResult,
} from './ts.js';

export interface TypesyncValidateOptions {
  definition: string;
  debug: boolean;
}

export type TypesyncValidateResult =
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
  generateTs(opts: TypesyncGenerateTsOptions): Promise<TypesyncGenerateTsResult>;

  /**
   * Generates TypeScript type definitions for the specified schema and returns the generation and the internal representation without writing anything to the filesystem.
   */
  generateTsRepresentation(opts: TypesyncGenerateTsRepresentationOptions): Promise<TypesyncGenerateTsResult>;

  generateSwift(opts: TypesyncGenerateSwiftOptions): Promise<TypesyncGenerateSwiftResult>;

  generatePy(opts: TypesyncGeneratePythonOptions): Promise<TypesyncGeneratePythonResult>;

  generateRules(opts: TypesyncGenerateRulesOptions): Promise<TypesyncGenerateRulesResult>;

  validate(opts: TypesyncValidateOptions): Promise<TypesyncValidateResult>;
}

export type TypesyncGenerateResult =
  | TypesyncGenerateTsResult
  | TypesyncGenerateSwiftResult
  | TypesyncGeneratePythonResult
  | TypesyncGenerateRulesResult;

/**
 * The programmatic interface for the Typesync CLI.
 */
export const typesync = createTypesync();
