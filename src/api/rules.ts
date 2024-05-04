import { type schema } from '../schema/index.js';

export interface GenerateRulesRepresentationOptions {
  definition: string;
  startMarker?: string;
  endMarker?: string;
  debug?: boolean;
}

export interface GenerateRulesOptions extends GenerateRulesRepresentationOptions {
  outFile: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
}

export type GenerateRulesOption = keyof GenerateRulesOptions;

export interface GenerateRulesResult {
  type: 'rules';
  schema: schema.Schema;
}
