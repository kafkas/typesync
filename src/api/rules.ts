import { RulesGeneration } from '../generators/rules/index.js';
import { GenerateRepresentationResult } from './_common.js';

export interface GenerateRulesRepresentationOptions {
  definition: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  debug?: boolean;
}

export interface GenerateRulesOptions extends GenerateRulesRepresentationOptions {
  outFile: string;
  startMarker?: string;
  endMarker?: string;
  indentation?: number;
}

export type GenerateRulesOption = keyof GenerateRulesOptions;

export interface GenerateRulesRepresentationResult extends GenerateRepresentationResult {
  type: 'rules';

  /**
   * A structured representation of the generated Security Rules validators.
   */
  generation: RulesGeneration;
}

export interface GenerateRulesResult extends GenerateRulesRepresentationResult {}
