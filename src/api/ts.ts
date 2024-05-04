import { TSGeneration } from '../generators/ts/index.js';
import { objectKeys } from '../util/object-keys.js';
import { GenerateRepresentationResult } from './_common.js';

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

export interface GenerateTsRepresentationOptions {
  definition: string;
  target: TSGenerationTarget;
  debug?: boolean;
}

export interface GenerateTsOptions extends GenerateTsRepresentationOptions {
  outFile: string;
  indentation?: number;
}

export type GenerateTsOption = keyof GenerateTsOptions;

export interface GenerateTsRepresentationResult extends GenerateRepresentationResult {
  type: 'ts';

  /**
   * A structured representation of the generated TypeScript types.
   */
  generation: TSGeneration;
}

export interface GenerateTsResult extends GenerateTsRepresentationResult {}
