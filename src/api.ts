import { schema } from './schema/index.js';
import { objectKeys } from './util/object-keys.js';

const TS_PLATFORMS = {
  'ts:firebase-admin:12': true,
  'ts:firebase-admin:11': true,
  'ts:firebase:10': true,
  'ts:firebase:9': true,
};

const SWIFT_PLATFORMS = {
  'swift:firebase:10': true,
};

const PYTHON_PLATFORMS = {
  'py:firebase-admin:6': true,
};

export type TSGenerationPlatform = keyof typeof TS_PLATFORMS;

export type SwiftGenerationPlatform = keyof typeof SWIFT_PLATFORMS;

export type PythonGenerationPlatform = keyof typeof PYTHON_PLATFORMS;

export function getTSPlatforms() {
  return objectKeys(TS_PLATFORMS);
}

export function getSwiftPlatforms() {
  return objectKeys(SWIFT_PLATFORMS);
}

export function getPythonPlatforms() {
  return objectKeys(PYTHON_PLATFORMS);
}

export interface TypesyncGenerateTsOptions {
  definition: string;
  platform: TSGenerationPlatform;
  outFile: string;
  indentation?: number;
  debug?: boolean;
}

export type TypesyncGenerateTsOption = keyof TypesyncGenerateTsOptions;

export interface TypesyncGenerateTsResult {
  type: 'ts';
  schema: schema.Schema;
}

export interface TypesyncGenerateSwiftOptions {
  definition: string;
  platform: SwiftGenerationPlatform;
  outFile: string;
  indentation?: number;
  debug?: boolean;
}

export type TypesyncGenerateSwiftOption = keyof TypesyncGenerateSwiftOptions;

export interface TypesyncGenerateSwiftResult {
  type: 'swift';
  schema: schema.Schema;
}

export interface TypesyncGeneratePyOptions {
  definition: string;
  platform: PythonGenerationPlatform;
  outFile: string;
  indentation?: number;
  customPydanticBase?: string;
  debug?: boolean;
}

export type TypesyncGeneratePyOption = keyof TypesyncGeneratePyOptions;

export interface TypesyncGeneratePyResult {
  type: 'python';
  schema: schema.Schema;
}

export interface TypesyncGenerateRulesOptions {
  definition: string;
  outFile: string;
  startMarker?: string;
  endMarker?: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
  debug?: boolean;
}

export type TypesyncGenerateRulesOption = keyof TypesyncGenerateRulesOptions;

export interface TypesyncGenerateRulesResult {
  type: 'rules';
  schema: schema.Schema;
}

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

export { createTypesync } from './core/typesync.js';
