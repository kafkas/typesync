import { SwiftGeneration } from '../generators/swift/index.js';
import { objectKeys } from '../util/object-keys.js';
import { GenerateRepresentationResult } from './_common.js';

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

export interface GenerateSwiftRepresentationResult extends GenerateRepresentationResult {
  type: 'swift';
  generation: SwiftGeneration;
}

export interface GenerateSwiftResult extends GenerateSwiftRepresentationResult {}
