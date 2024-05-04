import { TSGeneration } from '../generators/ts/index.js';
import { type schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const TS_TARGETS = {
  'firebase-admin@12': true,
  'firebase-admin@11': true,
  'firebase@10': true,
  'firebase@9': true,
};

export type TSGenerationTarget = keyof typeof TS_TARGETS;

export function getTSTargets() {
  return objectKeys(TS_TARGETS);
}

export interface TypesyncGenerateTsRepresentationOptions {
  definition: string;
  target: TSGenerationTarget;
  indentation?: number;
  debug?: boolean;
}

export interface TypesyncGenerateTsOptions extends TypesyncGenerateTsRepresentationOptions {
  outFile: string;
}

export type TypesyncGenerateTsOption = keyof TypesyncGenerateTsOptions;

export interface TypesyncGenerateTsResult {
  type: 'ts';
  schema: schema.Schema;
  generation: TSGeneration;
}
