import { type schema } from '../schema/index.js';

export interface TypesyncGenerateRulesRepresentationOptions {
  definition: string;
  startMarker?: string;
  endMarker?: string;
  validatorNamePattern?: string;
  validatorParamName?: string;
  indentation?: number;
  debug?: boolean;
}

export interface TypesyncGenerateRulesOptions extends TypesyncGenerateRulesRepresentationOptions {
  outFile: string;
}

export type TypesyncGenerateRulesOption = keyof TypesyncGenerateRulesOptions;

export interface TypesyncGenerateRulesResult {
  type: 'rules';
  schema: schema.Schema;
}
