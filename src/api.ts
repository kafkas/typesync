import { schema } from './schema/index.js';
import { objectKeys } from './util/object-keys.js';

const TS_TARGETS = {
  'firebase-admin@12': true,
  'firebase-admin@11': true,
  'firebase@10': true,
  'firebase@9': true,
};

const SWIFT_TARGETS = {
  'firebase@10': true,
};

const PYTHON_TARGETS = {
  'firebase-admin@6': true,
};

export type TSGenerationTarget = keyof typeof TS_TARGETS;

export type SwiftGenerationTarget = keyof typeof SWIFT_TARGETS;

export type PythonGenerationTarget = keyof typeof PYTHON_TARGETS;

export function getTSTargets() {
  return objectKeys(TS_TARGETS);
}

export function getSwiftTargets() {
  return objectKeys(SWIFT_TARGETS);
}

export function getPythonTargets() {
  return objectKeys(PYTHON_TARGETS);
}

export interface TypesyncGenerateTsOptions {
  definition: string;
  target: TSGenerationTarget;
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
  target: SwiftGenerationTarget;
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
  target: PythonGenerationTarget;
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
