import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';

export interface RulesTypeValidatorDeclaration {
  type: 'type-validator';
  validatorName: string;
  paramName: string;
  predicate: rules.Predicate;
}

export interface RulesReadonlyFieldValidatorDeclaration {
  type: 'readonly-field-validator';
  validatorName: string;
  prevDataParamName: string;
  nextDataParamName: string;
  predicate: rules.Predicate;
}

export type RulesDeclaration = RulesTypeValidatorDeclaration | RulesReadonlyFieldValidatorDeclaration;

export interface RulesGeneration {
  type: 'rules';
  typeValidatorDeclarations: RulesTypeValidatorDeclaration[];
  readonlyFieldValidatorDeclarations: RulesReadonlyFieldValidatorDeclaration[];
}

export interface RulesGeneratorConfig {
  typeValidatorNamePattern: string;
  typeValidatorParamName: string;
  readonlyFieldValidatorNamePattern: string;
  readonlyFieldValidatorPrevDataParamName: string;
  readonlyFieldValidatorNextDataParamName: string;
}

export interface RulesGenerator {
  generate(s: schema.Schema): RulesGeneration;
}
