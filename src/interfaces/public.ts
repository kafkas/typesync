export type GenerationPlatform = 'ts' | 'swift';

export interface TypeSyncGenerateOptions {
  pathToSchema: string;
  platform: GenerationPlatform;
  pathToOutput: string;
}

export interface TypeSyncConfig {
  debug: boolean;
}

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<void>;
}
