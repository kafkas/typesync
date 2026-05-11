import { ZodGeneration } from '../generators/zod/index.js';
import { objectKeys } from '../util/object-keys.js';
import { GenerateRepresentationResult } from './_common.js';

/**
 * Targets supported by `generate-zod`. They mirror the `generate-ts` targets
 * because the only place the SDK identity matters for Zod is the runtime class
 * that backs the `timestamp` and `bytes` schema types (e.g. `Buffer` for the
 * Node admin SDK, `firestore.Bytes` for the web SDK, `firestore.Blob` for
 * `react-native-firebase`).
 */
const ZOD_TARGETS = {
  'firebase-admin@13': true,
  'firebase-admin@12': true,
  'firebase-admin@11': true,
  'firebase-admin@10': true,
  'firebase@11': true,
  'firebase@10': true,
  'firebase@9': true,
  'react-native-firebase@21': true,
  'react-native-firebase@20': true,
  'react-native-firebase@19': true,
};

export type ZodGenerationTarget = keyof typeof ZOD_TARGETS;

export function getZodTargets() {
  return objectKeys(ZOD_TARGETS);
}

const ZOD_VARIANTS = {
  v3: true,
  v4: true,
};

/**
 * Which Zod major release the generated code should target. The two majors
 * differ in a handful of API surface points (record key argument, strict/loose
 * object factories) and the generator picks the right shape based on this.
 */
export type ZodVariant = keyof typeof ZOD_VARIANTS;

export function getZodVariants() {
  return objectKeys(ZOD_VARIANTS);
}

export interface GenerateZodRepresentationOptions {
  definition: string;
  target: ZodGenerationTarget;
  variant?: ZodVariant;
  /**
   * Pattern that controls how the generated Zod schema constants are named.
   * Must contain the literal substring `{modelName}`. For example, with the
   * default `'{modelName}Schema'` a model named `User` becomes `UserSchema`.
   */
  schemaNamePattern?: string;
  /**
   * When `true`, the generator emits an inferred TypeScript type alongside
   * each Zod schema, e.g. `export type User = z.infer<typeof UserSchema>;`.
   * Defaults to `false`.
   */
  emitInferredTypes?: boolean;
  /**
   * Pattern that controls how the inferred TypeScript types are named when
   * `emitInferredTypes` is `true`. Must contain the literal substring
   * `{modelName}`. For example, with the default `'{modelName}'` a model
   * named `User` becomes `User`. Ignored when `emitInferredTypes` is `false`.
   */
  inferredTypeNamePattern?: string;
  debug?: boolean;
}

export interface GenerateZodOptions extends GenerateZodRepresentationOptions {
  outFile: string;
  indentation?: number;
}

export type GenerateZodOption = keyof GenerateZodOptions;

export interface GenerateZodRepresentationResult extends GenerateRepresentationResult {
  type: 'zod';

  /**
   * A structured representation of the generated Zod schemas.
   */
  generation: ZodGeneration;
}

export interface GenerateZodResult extends GenerateZodRepresentationResult {}
