import { objectKeys } from './util/object-keys.js';

const TS_PLATFORMS = {
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

export interface TypeSyncGenerateOptions {
  definition: string;
  platform: GenerationPlatform;
  outputDir: string;
  indentation: number;
  debug: boolean;
}

export interface TypeSyncGenerateResult {
  aliasModelCount: number;
  documentModelCount: number;
  pathToRootFile: string;
}

export interface TypeSyncValidateOptions {
  definition: string;
  debug: boolean;
}

export type TypeSyncValidateResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<TypeSyncGenerateResult>;

  validate(opts: TypeSyncValidateOptions): Promise<TypeSyncValidateResult>;
}

export { createTypeSync } from './core/typesync.js';
