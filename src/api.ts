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
  pathToDefinition: string;
  platform: GenerationPlatform;
  pathToOutputDir: string;
  indentation: number;
  debug: boolean;
}

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<void>;
}

export { createTypeSync } from './core/typesync.js';
