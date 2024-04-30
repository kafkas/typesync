import type { rules } from '../../platforms/rules/index.js';

export interface RulesValidatorDeclaration {
  type: 'validator';
  modelName: string;
  modelType: rules.Object;
}

export type RulesDeclaration = RulesValidatorDeclaration;

export interface RulesGeneration {
  type: 'rules';
  declarations: RulesDeclaration[];
}
