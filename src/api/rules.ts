import { type schema } from '../schema/index.js';

export interface TypesyncGenerateRulesOptions {
  definition: string;
  outFile: string;
  startMarker?: string;
  endMarker?: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
  debug?: boolean;
}

export type TypesyncGenerateRulesOption = keyof TypesyncGenerateRulesOptions;

export interface TypesyncGenerateRulesResult {
  type: 'rules';
  schema: schema.Schema;
}
