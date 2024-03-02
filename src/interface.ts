type GenerationPlatform = "ios" | "ts";

interface TypeSyncGenerateOptions {
  pathToSchema: string;
  pathToOutput: string;
  platform: GenerationPlatform;
}

export interface TypeSync {
  generate(opts: TypeSyncGenerateOptions): Promise<void>;
}
