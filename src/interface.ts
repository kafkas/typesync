type GenerationPlatform = 'ios' | 'ts';

export interface TypeSyncGenerateOptions {
  pathToSchema: string;
  platform: GenerationPlatform;
  pathToOutput: string;
}

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<void>;
}
