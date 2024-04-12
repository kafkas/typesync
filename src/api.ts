import { objectKeys } from './util/object-keys.js';

const TS_PLATFORMS = {
  'ts:firebase-admin:12': true,
  'ts:firebase-admin:11': true,
};

const PYTHON_PLATFORMS = {
  'py:firebase-admin:6': true,
};

export type TSGenerationPlatform = keyof typeof TS_PLATFORMS;

export type PythonGenerationPlatform = keyof typeof PYTHON_PLATFORMS;

export type GenerationPlatform = TSGenerationPlatform | PythonGenerationPlatform;

export function getTSPlatforms() {
  return objectKeys(TS_PLATFORMS);
}

export function getPythonPlatforms() {
  return objectKeys(PYTHON_PLATFORMS);
}

export function getPlatforms(): GenerationPlatform[] {
  return [...getTSPlatforms(), ...getPythonPlatforms()];
}

export interface TypesyncGenerateOptions {
  definition: string;
  platform: GenerationPlatform;
  outFile: string;
  indentation: number;
  debug: boolean;
}

export interface TypesyncGenerateResult {
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

  validate(opts: TypesyncValidateOptions): Promise<TypesyncValidateResult>;
}

export { createTypesync } from './core/typesync.js';
