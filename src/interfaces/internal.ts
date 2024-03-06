import type { PythonGenerationPlatform, TSGenerationPlatform } from './public';
import type { schema } from './schema';

export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export interface DefinitionParser {
  parseDefinition(pathToDefinition: string): schema.Schema;
}

export interface TSGeneratorConfig {
  platform: TSGenerationPlatform;
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface PythonGeneratorConfig {
  platform: PythonGenerationPlatform;
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface GenerationOutput {
  toString(): string;
}

export interface Generator {
  generate(s: schema.Schema): Promise<GenerationOutput>;
}
