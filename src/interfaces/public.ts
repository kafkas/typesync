export type TSGenerationPlatform = 'ts:firebase-admin:11';

export type SwiftGenerationPlatform = 'swift';

export type GenerationPlatform = TSGenerationPlatform | SwiftGenerationPlatform;

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
