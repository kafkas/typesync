import type { PythonGenerationPlatform } from '../../api.js';
import type { python } from '../../platforms/python/index.js';
import type { schema } from '../../schema/index.js';

export interface PythonAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: python.Type;
  modelDocs: string | undefined;
}

export interface PythonEnumClassDeclaration {
  type: 'enum-class';
  modelName: string;
  modelType: python.EnumClass;
  modelDocs: string | undefined;
}

export interface PythonPydanticClassDeclaration {
  type: 'pydantic-class';
  modelName: string;
  modelType: python.ObjectClass;
  modelDocs: string | undefined;
}

export type PythonDeclaration = PythonAliasDeclaration | PythonEnumClassDeclaration | PythonPydanticClassDeclaration;

export interface PythonGeneration {
  type: 'python';
  declarations: PythonDeclaration[];
}

export interface PythonGeneratorConfig {
  platform: PythonGenerationPlatform;
}

export interface PythonGenerator {
  generate(s: schema.Schema): PythonGeneration;
}
