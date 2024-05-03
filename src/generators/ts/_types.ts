import type { TSGenerationTarget } from '../../api.js';
import type { ts } from '../../platforms/ts/index.js';
import type { schema } from '../../schema/index.js';

export interface TSAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: ts.Type;
  modelDocs: string | undefined;
}

export interface TSInterfaceDeclaration {
  type: 'interface';
  modelName: string;
  modelType: ts.Object;
  modelDocs: string | undefined;
}

export type TSDeclaration = TSAliasDeclaration | TSInterfaceDeclaration;

export interface TSGeneration {
  type: 'ts';
  declarations: TSDeclaration[];
}

export interface TSGeneratorConfig {
  target: TSGenerationTarget;
}

export interface TSGenerator {
  generate(s: schema.Schema): TSGeneration;
}
