import type { TSGenerationPlatform } from '../../api';
import type { ts } from '../../platforms/ts';
import type { schema } from '../../schema';

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
  /**
   * The number of spaces for each indentation.
   */
  indentation: number;
}

export interface TSGenerator {
  generate(s: schema.Schema): TSGeneration;
}
