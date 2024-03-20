export type TSGenerationPlatform = 'ts:firebase-admin:11';

export type PythonGenerationPlatform = 'py:firebase-admin:6';

export type GenerationPlatform = TSGenerationPlatform | PythonGenerationPlatform;

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

export { createTypeSync } from './core/typesync';
