import type { PythonGenerationTarget } from '../../api/index.js';
import type { python } from '../../platforms/python/index.js';
import type { schema } from '../../schema/index.js';

export interface PythonAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: python.Type;
  modelDocs: string | null;
}

export interface PythonEnumClassDeclaration {
  type: 'enum-class';
  modelName: string;
  modelType: python.EnumClass;
  modelDocs: string | null;
}

export interface PythonPydanticClassDeclaration {
  type: 'pydantic-class';
  modelName: string;
  modelType: python.ObjectClass;
  modelDocs: string | null;
}

export type PythonDeclaration = PythonAliasDeclaration | PythonEnumClassDeclaration | PythonPydanticClassDeclaration;

export interface PythonGeneration {
  type: 'python';
  declarations: PythonDeclaration[];
}

export interface PythonGeneratorConfig {
  target: PythonGenerationTarget;
}

export interface PythonGenerator {
  generate(s: schema.Schema): PythonGeneration;
}
