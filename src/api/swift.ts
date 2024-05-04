import { type schema } from '../schema/index.js';
import { objectKeys } from '../util/object-keys.js';

const SWIFT_TARGETS = {
  'firebase@10': true,
};

export type SwiftGenerationTarget = keyof typeof SWIFT_TARGETS;

export function getSwiftTargets() {
  return objectKeys(SWIFT_TARGETS);
}

export interface TypesyncGenerateSwiftRepresentationOptions {
  definition: string;
  target: SwiftGenerationTarget;
  debug?: boolean;
}

export interface TypesyncGenerateSwiftOptions extends TypesyncGenerateSwiftRepresentationOptions {
  outFile: string;
  indentation?: number;
}

export type TypesyncGenerateSwiftOption = keyof TypesyncGenerateSwiftOptions;

export interface TypesyncGenerateSwiftResult {
  type: 'swift';
  schema: schema.Schema;
}
