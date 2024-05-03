import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';

export interface RulesValidatorDeclaration {
  type: 'validator';
  modelName: string;
  modelType: rules.Type;
}

export type RulesDeclaration = RulesValidatorDeclaration;

export interface RulesGeneration {
  type: 'rules';
  declarations: RulesDeclaration[];
}

export interface RulesGeneratorConfig {}

export interface RulesGenerator {
  generate(s: schema.Schema): RulesGeneration;
}
