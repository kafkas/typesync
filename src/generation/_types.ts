import { python } from '../platforms/python';
import { ts } from '../platforms/ts';

export interface TSAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: ts.Type;
}

export interface TSInterfaceDeclaration {
  type: 'interface';
  modelName: string;
  modelType: ts.ObjectType;
}

export type TSDeclaration = TSAliasDeclaration | TSInterfaceDeclaration;

export interface TSGeneration {
  type: 'ts';
  declarations: TSDeclaration[];
}

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

export type Generation = PythonGeneration | TSGeneration;
