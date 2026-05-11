import { ZodGeneration } from '../generators/zod/index.js';
import { objectKeys } from '../util/object-keys.js';
import { GenerateRepresentationResult } from './_common.js';
import type { TSGenerationTarget } from './ts.js';

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
  /**
   * Which Firestore SDK the generated Zod schemas validate values against.
   * Reuses the `generate-ts` target list — the SDK choice only affects the
   * runtime class checked by `z.instanceof(...)` for the `timestamp` and
   * `bytes` primitives (e.g. `Buffer` for the Node admin SDK, `firestore.Bytes`
   * for the web SDK, `firestore.Blob` for `react-native-firebase`).
   */
  target: TSGenerationTarget;
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
