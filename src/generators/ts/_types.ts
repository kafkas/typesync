import type { TSGenerationTarget, TSObjectTypeFormat } from '../../api/index.js';
import type { ts } from '../../platforms/ts/index.js';
import type { schema } from '../../schema/index.js';

export interface TSAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: ts.Type;
  modelDocs: string | null;
}

export interface TSInterfaceDeclaration {
  type: 'interface';
  modelName: string;
  modelType: ts.Object;
  modelDocs: string | null;
}

export type TSDeclaration = TSAliasDeclaration | TSInterfaceDeclaration;

export interface TSGeneration {
  type: 'ts';
  declarations: TSDeclaration[];
}

export interface TSGeneratorConfig {
  target: TSGenerationTarget;
  objectTypeFormat: TSObjectTypeFormat;
}

export interface TSGenerator {
  generate(s: schema.Schema): TSGeneration;
}
