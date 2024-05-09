import { RulesGeneration } from '../generators/rules/index.js';
import { Schema } from '../schema-new/index.js';

export interface GenerateRulesRepresentationOptions {
  definition: string;
  debug?: boolean;
}

export interface GenerateRulesOptions extends GenerateRulesRepresentationOptions {
  outFile: string;
  startMarker?: string;
  endMarker?: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
}

export type GenerateRulesOption = keyof GenerateRulesOptions;

// TODO: Should extend GenerateRepresentationResult
export interface GenerateRulesRepresentationResult {
  type: 'rules';

  schema: Schema;

  /**
   * A structured representation of the generated Security Rules validators.
   */
  generation: RulesGeneration;
}

export interface GenerateRulesResult extends GenerateRulesRepresentationResult {}
