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

export interface PythonGeneration {
  type: 'python';
}

export interface TSGeneration {
  type: 'ts';
  declarations: TSDeclaration[];
}

export type Generation = PythonGeneration | TSGeneration;
