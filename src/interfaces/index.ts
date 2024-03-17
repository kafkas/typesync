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

export interface Generator {
  generate(s: schema.Schema): Promise<generation.Generation>;
}
