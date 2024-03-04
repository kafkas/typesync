import type { TSGenerationPlatform } from './public';
import type { Schema } from './schema';

export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export interface DefinitionParser {
  parseDefinition(pathToDefinition: string): Schema;
}

export interface TSGeneratorConfig {
  platform: TSGenerationPlatform;
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(schema: Schema): Promise<GenerationOutput>;
}
