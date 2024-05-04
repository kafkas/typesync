import { SwiftGeneration } from '../generators/swift/index.js';
import { type schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const SWIFT_TARGETS = {
  'firebase@10': true,
};

export type SwiftGenerationTarget = keyof typeof SWIFT_TARGETS;

export function getSwiftTargets() {
  return objectKeys(SWIFT_TARGETS);
}

export interface GenerateSwiftRepresentationOptions {
  definition: string;
  target: SwiftGenerationTarget;
  debug?: boolean;
}

export interface GenerateSwiftOptions extends GenerateSwiftRepresentationOptions {
  outFile: string;
  indentation?: number;
}

export type GenerateSwiftOption = keyof GenerateSwiftOptions;

export interface GenerateSwiftRepresentationResult {
  type: 'swift';
  schema: schema.Schema;
  generation: SwiftGeneration;
}

export interface GenerateSwiftResult extends GenerateSwiftRepresentationResult {}
