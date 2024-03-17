import type { PythonGenerationPlatform } from '../../api';
import type { python } from '../../platforms/python';
import type { schema } from '../../schema';

export interface PythonAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: python.Type;
}

export interface PythonEnumClassDeclaration {
  type: 'enum-class';
  modelName: string;
  modelType: python.Type;
}

export interface PythonPydanticClassDeclaration {
  type: 'pydantic-class';
  modelName: string;
  modelType: python.Type;
}

export type PythonDeclaration = PythonAliasDeclaration | PythonEnumClassDeclaration | PythonPydanticClassDeclaration;

export interface PythonGeneration {
  type: 'python';
  declarations: PythonDeclaration[];
}

export interface PythonGeneratorConfig {
  platform: PythonGenerationPlatform;
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface PythonGenerator {
  generate(s: schema.Schema): PythonGeneration;
}
