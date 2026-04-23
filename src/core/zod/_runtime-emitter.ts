import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

import type { ZodEmitter } from './_emitter.js';

/**
 * A registry that holds the live `ZodType` for each model in the schema. It is
 * populated lazily during `buildZodSchemaMap` so that mutually recursive aliases
 * resolve correctly via `z.lazy`.
 */
export interface RuntimeZodRegistry {
  get(modelName: string): z.ZodTypeAny | undefined;
}

/**
 * Constructs the runtime emitter. The emitter needs a registry reference up-front
 * because `reference(name)` must be able to resolve the target model at validation
 * time, which is generally after the schema map has been fully constructed.
 */
export function createRuntimeZodEmitter(registry: RuntimeZodRegistry): ZodEmitter<z.ZodTypeAny> {
  return {
    any: () => z.any(),
    unknown: () => z.unknown(),
    nullType: () => z.null(),
    string: () => z.string(),
    boolean: () => z.boolean(),
    int: () => z.number().int(),
    double: () => z.number(),
    timestamp: () => z.instanceof(Timestamp),

    stringLiteral: value => z.literal(value),
    intLiteral: value => z.literal(value),
    booleanLiteral: value => z.literal(value),

    stringEnum: values => z.union(values.map(v => z.literal(v)) as [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]),
    intEnum: values => z.union(values.map(v => z.literal(v)) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]),

    tuple: elements => {
      if (elements.length === 0) return z.tuple([]);
      return z.tuple(elements as [z.ZodTypeAny, ...z.ZodTypeAny[]]);
    },
    array: element => z.array(element),
    record: value => z.record(z.string(), value),

    object: (fields, additionalFields) => {
      const shape: Record<string, z.ZodTypeAny> = {};
      for (const field of fields) {
        shape[field.name] = field.optional ? field.value.optional() : field.value;
      }
      const base = z.object(shape);
      // TODO(kafkas): Use z.looseObject() or .loose() instead.
      return additionalFields ? base.passthrough() : base.strict();
    },

    simpleUnion: variants => {
      if (variants.length < 2) {
        // z.union requires at least two variants. If we ever see fewer, fall back gracefully.
        return variants[0] ?? z.never();
      }
      return z.union(variants as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
    },

    discriminatedUnion: (discriminant, variants) => {
      if (variants.length < 2) {
        return variants[0] ?? z.never();
      }
      // TODO(kafkas): Fix this.
      // zod@4's `z.discriminatedUnion` signature exposes a complex generic that is awkward
      // to satisfy from our emitter-level perspective. Variants are only ever constructed
      // as ZodObjects upstream (per `schema.DiscriminatedUnion` semantics), so we cast via
      // `unknown` to bypass the generic while preserving runtime behaviour.
      return z.discriminatedUnion(discriminant, variants as unknown as Parameters<typeof z.discriminatedUnion>[1]);
    },

    reference: modelName =>
      z.lazy(() => {
        const target = registry.get(modelName);
        if (!target) {
          throw new Error(`Zod reference to unknown model '${modelName}'.`);
        }
        return target;
      }),
  };
}
