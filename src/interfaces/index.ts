import type { PythonGenerationPlatform, TSGenerationPlatform } from '../api';
import type { definition } from '../definition';
import type { generation } from '../generation';
import type { schema } from '../schema';

export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export interface DefinitionParser {
  parseDefinition(pathToDefinition: string): definition.Definition;
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

export interface TSGenerator {
  generate(s: schema.Schema): generation.TSGeneration;
}

export interface PythonGenerator {
  generate(s: schema.Schema): generation.PythonGeneration;
}

export interface Generator {
  generate(s: schema.Schema): generation.Generation;
}
