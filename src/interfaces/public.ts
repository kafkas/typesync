export type TSGenerationPlatform = 'ts:firebase-admin:11';

export type GenerationPlatform = TSGenerationPlatform;

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
