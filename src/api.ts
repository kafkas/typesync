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

const RULES_PLATFORMS = {
  'rules:2': true,
};

export type TSGenerationPlatform = keyof typeof TS_PLATFORMS;

export type SwiftGenerationPlatform = keyof typeof SWIFT_PLATFORMS;

export type PythonGenerationPlatform = keyof typeof PYTHON_PLATFORMS;

export type RulesGenerationPlatform = keyof typeof RULES_PLATFORMS;

export type GenerationPlatform = TSGenerationPlatform | SwiftGenerationPlatform | PythonGenerationPlatform;

export function getTSPlatforms() {
  return objectKeys(TS_PLATFORMS);
}

export function getSwiftPlatforms() {
  return objectKeys(SWIFT_PLATFORMS);
}

export function getPythonPlatforms() {
  return objectKeys(PYTHON_PLATFORMS);
}

export function getRulesPlatforms() {
  return objectKeys(RULES_PLATFORMS);
}

export function getPlatforms(): GenerationPlatform[] {
  return [...getTSPlatforms(), ...getSwiftPlatforms(), ...getPythonPlatforms()];
}

export type TypesyncGenerateOption = keyof TypesyncGenerateOptions;

export interface TypesyncGenerateOptions {
  definition: string;
  platform: GenerationPlatform;
  outFile: string;
  indentation: number;
  customPydanticBase?: string;
  debug: boolean;
}

export interface TypesyncGenerateResult {
  aliasModelCount: number;
  documentModelCount: number;
}

export type TypesyncGenerateRulesOption = keyof TypesyncGenerateRulesOptions;

export interface TypesyncGenerateRulesOptions {
  definition: string;
  platform: RulesGenerationPlatform;
  outFile: string;
  startMarker: string;
  endMarker: string;
  validatorParamName: string;
  indentation: number;
  debug: boolean;
}

export interface TypesyncGenerateRulesResult {
  aliasModelCount: number;
  documentModelCount: number;
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
  generate(opts: TypesyncGenerateOptions): Promise<TypesyncGenerateResult>;

  generateRules(opts: TypesyncGenerateRulesOptions): Promise<TypesyncGenerateRulesResult>;

  validate(opts: TypesyncValidateOptions): Promise<TypesyncValidateResult>;
}

export { createTypesync } from './core/typesync.js';
