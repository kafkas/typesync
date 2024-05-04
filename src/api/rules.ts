import { type schema } from '../schema/index.js';

export interface TypesyncGenerateRulesRepresentationOptions {
  definition: string;
  startMarker?: string;
  endMarker?: string;
  debug?: boolean;
}

export interface TypesyncGenerateRulesOptions extends TypesyncGenerateRulesRepresentationOptions {
  outFile: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
}

export type TypesyncGenerateRulesOption = keyof TypesyncGenerateRulesOptions;

export interface TypesyncGenerateRulesResult {
  type: 'rules';
  schema: schema.Schema;
}
