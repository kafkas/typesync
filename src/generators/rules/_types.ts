import type { ts } from '../../platforms/ts/index.js';

export interface RulesValidatorDeclaration {
  type: 'validator';
  modelName: string;
  modelType: ts.Object;
}

export type RulesDeclaration = RulesValidatorDeclaration;

export interface RulesGeneration {
  type: 'rules';
  declarations: RulesDeclaration[];
}
