export type TSGenerationPlatform = 'ts:firebase-admin:11';

export type PythonGenerationPlatform = 'py:firebase-admin:6';

export type GenerationPlatform = TSGenerationPlatform | PythonGenerationPlatform;

export interface TypeSyncGenerateOptions {
  pathToDefinition: string;
  platform: GenerationPlatform;
  pathToOutput: string;
}

export interface TypeSyncConfig {
  debug: boolean;
}

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<void>;
}
