import { type schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const SWIFT_TARGETS = {
  'firebase@10': true,
};

export type SwiftGenerationTarget = keyof typeof SWIFT_TARGETS;

export function getSwiftTargets() {
  return objectKeys(SWIFT_TARGETS);
}

export interface TypesyncGenerateSwiftOptions {
  definition: string;
  target: SwiftGenerationTarget;
  outFile: string;
  indentation?: number;
  debug?: boolean;
}

export type TypesyncGenerateSwiftOption = keyof TypesyncGenerateSwiftOptions;

export interface TypesyncGenerateSwiftResult {
  type: 'swift';
  schema: schema.Schema;
}
