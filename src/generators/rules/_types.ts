import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';

export interface RulesTypeValidatorDeclaration {
  type: 'type-validator';
  modelName: string;
  modelType: rules.Type;
}

export interface RulesReadonlyFieldValidatorDeclaration {
  type: 'readonly-field-validator';
  modelName: string;
  // TODO: Implement
}

export type RulesDeclaration = RulesTypeValidatorDeclaration | RulesReadonlyFieldValidatorDeclaration;

export interface RulesGeneration {
  type: 'rules';
  typeValidatorDeclarations: RulesTypeValidatorDeclaration[];
  readonlyFieldValidatorDeclarations: RulesReadonlyFieldValidatorDeclaration[];
}

export interface RulesGeneratorConfig {}

export interface RulesGenerator {
  generate(s: schema.Schema): RulesGeneration;
}
