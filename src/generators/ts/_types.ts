import type { TSGenerationPlatform } from '../../api.js';
import type { ts } from '../../platforms/ts/index.js';
import type { schema } from '../../schema/index.js';

export interface TSAliasDeclaration {
  type: 'alias';
  modelName: string;
  modelType: ts.Type;
}

export interface TSInterfaceDeclaration {
  type: 'interface';
  modelName: string;
  modelType: ts.Object;
}

export type TSDeclaration = TSAliasDeclaration | TSInterfaceDeclaration;

export interface TSGeneration {
  type: 'ts';
  declarations: TSDeclaration[];
}

export interface TSGeneratorConfig {
  platform: TSGenerationPlatform;
}

export interface TSGenerator {
  generate(s: schema.Schema): TSGeneration;
}
