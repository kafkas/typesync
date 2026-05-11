import type { TSGenerationTarget } from '../../api/ts.js';
import { assertNever } from '../../util/assert.js';
import type { ZodEmitter } from './_emitter.js';

/**
 * Which Zod major API the emitter should target. The two majors differ in a
 * handful of places that matter to codegen:
 *
 * - records: v3 takes a single argument `z.record(value)`; v4 requires the key
 *   schema as the first argument: `z.record(z.string(), value)`.
 * - object passthrough/strict: v3 expresses these as chainable methods on
 *   `z.object(...)` (`.strict()`, `.passthrough()`); v4 ships dedicated
 *   factories (`z.strictObject(...)`, `z.looseObject(...)`).
 */
export type ZodVariant = 'v3' | 'v4';

export interface ZodCodegenEmitterConfig {
  variant: ZodVariant;
  /**
   * Identifies the Firestore SDK that the generated Zod schemas will be
   * validating data against. Shares the `generate-ts` target list — the SDK
   * identity only matters for picking the right runtime class for the
   * `timestamp` and `bytes` primitives (e.g. `Buffer` vs `firestore.Bytes`
   * vs `firestore.Blob`).
   */
  target: TSGenerationTarget;
  /**
   * Maps a Typesync model name (e.g. `User`) to the identifier under which the
   * corresponding Zod schema will be exported in the generated file
   * (e.g. `UserSchema`). The codegen emitter uses this to wire references
   * between schemas.
   */
  getSchemaIdentifierForModel: (modelName: string) => string;
}

/**
 * Emitter that produces Zod **source code** (as plain strings) instead of live
 * `ZodType` instances. Used by the `generate-zod` command. The runtime emitter
 * (`./_runtime-emitter.ts`) and this codegen emitter are driven by the same
 * `buildZodFromType` traversal so the schema-to-Zod mapping rules live in
 * exactly one place.
 */
export function createCodegenZodEmitter(config: ZodCodegenEmitterConfig): ZodEmitter<string> {
  const { variant, target, getSchemaIdentifierForModel } = config;

  const timestampExpression = expressionForTimestampInstanceCheck(target);
  const bytesExpression = expressionForBytesInstanceCheck(target);

  return {
    any: () => 'z.any()',
    unknown: () => 'z.unknown()',
    nullType: () => 'z.null()',
    string: () => 'z.string()',
    boolean: () => 'z.boolean()',
    int: () => 'z.number().int()',
    double: () => 'z.number()',
    timestamp: () => `z.instanceof(${timestampExpression})`,
    bytes: () => `z.instanceof(${bytesExpression})`,

    stringLiteral: value => `z.literal(${JSON.stringify(value)})`,
    intLiteral: value => `z.literal(${value})`,
    booleanLiteral: value => `z.literal(${value})`,

    // String enums use the canonical `z.enum([...])` form. It works in Zod
    // v3 and v4 alike (including with a single member) and gives much better
    // error messages than a literal union. Int enums fall back to a literal
    // union because `z.enum([...])` is string-only in Zod and the v4-only
    // `z.literal([1, 2])` form does not accept single-member arrays.
    stringEnum: values => `z.enum([${values.map(v => JSON.stringify(v)).join(', ')}])`,
    intEnum: values => `z.union([${values.map(v => `z.literal(${v})`).join(', ')}])`,

    tuple: elements => `z.tuple([${elements.join(', ')}])`,
    array: element => `z.array(${element})`,
    record: value => (variant === 'v3' ? `z.record(${value})` : `z.record(z.string(), ${value})`),

    object: (fields, additionalFields) => {
      const propertyEntries = fields.map(field => {
        let valueExpression = field.value;
        if (field.docs !== null && field.docs.length > 0) {
          valueExpression = `${valueExpression}.describe(${JSON.stringify(field.docs)})`;
        }
        if (field.optional) {
          valueExpression = `${valueExpression}.optional()`;
        }
        return `${propertyKey(field.name)}: ${valueExpression}`;
      });
      const objectLiteral = propertyEntries.length > 0 ? `{ ${propertyEntries.join(', ')} }` : '{}';
      return objectFactoryExpression(variant, additionalFields, objectLiteral);
    },

    // Mirrors the runtime emitter: a degenerate 0/1-variant union collapses to
    // its sole variant (or `z.never()` if empty) rather than emitting a literal
    // `z.union([single])`. Reasons: (1) it keeps both emitters semantically
    // equivalent; (2) it sidesteps Zod v3's `[A, A, ...A[]]` tuple type for
    // `z.union`, which would otherwise require an `as`-cast in the generated
    // file; (3) the output is cleaner.
    simpleUnion: unionVariants => {
      if (unionVariants.length < 2) return unionVariants[0] ?? 'z.never()';
      return `z.union([${unionVariants.join(', ')}])`;
    },

    discriminatedUnion: (discriminant, unionVariants) => {
      if (unionVariants.length < 2) return unionVariants[0] ?? 'z.never()';
      return `z.discriminatedUnion(${JSON.stringify(discriminant)}, [${unionVariants.join(', ')}])`;
    },

    reference: modelName => {
      const identifier = getSchemaIdentifierForModel(modelName);
      // `z.lazy` defers identifier access to validation time, which is what
      // makes mutually recursive schemas in the generated file work regardless
      // of declaration order.
      return `z.lazy(() => ${identifier})`;
    },
  };
}

function objectFactoryExpression(variant: ZodVariant, additionalFields: boolean, objectLiteral: string): string {
  switch (variant) {
    case 'v3':
      return additionalFields ? `z.object(${objectLiteral}).passthrough()` : `z.object(${objectLiteral}).strict()`;
    case 'v4':
      return additionalFields ? `z.looseObject(${objectLiteral})` : `z.strictObject(${objectLiteral})`;
    default:
      assertNever(variant);
  }
}

const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function propertyKey(name: string): string {
  return VALID_IDENTIFIER_REGEX.test(name) ? name : JSON.stringify(name);
}

function expressionForTimestampInstanceCheck(target: TSGenerationTarget): string {
  switch (target) {
    case 'firebase-admin@13':
    case 'firebase-admin@12':
    case 'firebase-admin@11':
    case 'firebase-admin@10':
    case 'firebase@11':
    case 'firebase@10':
    case 'firebase@9':
    case 'react-native-firebase@21':
    case 'react-native-firebase@20':
    case 'react-native-firebase@19':
      return 'firestore.Timestamp';
    default:
      assertNever(target);
  }
}

function expressionForBytesInstanceCheck(target: TSGenerationTarget): string {
  switch (target) {
    case 'firebase-admin@13':
    case 'firebase-admin@12':
    case 'firebase-admin@11':
    case 'firebase-admin@10':
      // Firestore bytes are represented as Node `Buffer` in admin. Buffer
      // has a public constructor so it satisfies `z.instanceof` directly.
      return 'Buffer';
    case 'firebase@11':
    case 'firebase@10':
    case 'firebase@9':
      // `firestore.Bytes` declares a private constructor, which violates the
      // `new (...args: any[]) => any` constraint enforced by `z.instanceof`.
      // The cast has to go through `unknown` because TypeScript otherwise
      // refuses the conversion ("private vs public constructor"). The cast
      // is erased at runtime; the actual instance check still runs against
      // the real class object.
      return 'firestore.Bytes as unknown as new (...args: never[]) => firestore.Bytes';
    case 'react-native-firebase@21':
    case 'react-native-firebase@20':
    case 'react-native-firebase@19':
      // Same reason as `firestore.Bytes` above — `firestore.Blob` has a
      // private constructor in the `@react-native-firebase/firestore` types.
      return 'firestore.Blob as unknown as new (...args: never[]) => firestore.Blob';
    default:
      assertNever(target);
  }
}
