import { createTypesync } from '../core/typesync.js';
import type { TypesyncGeneratePyOptions, TypesyncGeneratePyResult } from './python.js';
import type { TypesyncGenerateRulesOptions, TypesyncGenerateRulesResult } from './rules.js';
import type { TypesyncGenerateSwiftOptions, TypesyncGenerateSwiftResult } from './swift.js';
import type { TypesyncGenerateTsOptions, TypesyncGenerateTsResult } from './ts.js';

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
  generateTs(opts: TypesyncGenerateTsOptions): Promise<TypesyncGenerateTsResult>;

  generateSwift(opts: TypesyncGenerateSwiftOptions): Promise<TypesyncGenerateSwiftResult>;

  generatePy(opts: TypesyncGeneratePyOptions): Promise<TypesyncGeneratePyResult>;

  generateRules(opts: TypesyncGenerateRulesOptions): Promise<TypesyncGenerateRulesResult>;

  validate(opts: TypesyncValidateOptions): Promise<TypesyncValidateResult>;
}

export type TypesyncGenerateResult =
  | TypesyncGenerateTsResult
  | TypesyncGenerateSwiftResult
  | TypesyncGeneratePyResult
  | TypesyncGenerateRulesResult;

/**
 * The programmatic interface for the Typesync CLI.
 */
export const typesync = createTypesync();
