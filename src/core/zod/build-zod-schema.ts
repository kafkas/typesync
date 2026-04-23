import type { z } from 'zod';

import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type { ZodEmitter } from './_emitter.js';
import { type RuntimeZodRegistry, createRuntimeZodEmitter } from './_runtime-emitter.js';

/**
 * Walks a Typesync schema type and drives the specified emitter to produce an output
 * value. This function is the single place in the codebase where schema types are
 * translated into Zod-shaped constructs, so both runtime validation and future codegen
 * share the exact same rules.
 */
export function buildZodFromType<TOut>(type: schema.types.Type, emitter: ZodEmitter<TOut>): TOut {
  switch (type.type) {
    case 'any':
      return emitter.any();
    case 'unknown':
      return emitter.unknown();
    case 'nil':
      return emitter.nullType();
    case 'string':
      return emitter.string();
    case 'boolean':
      return emitter.boolean();
    case 'int':
      return emitter.int();
    case 'double':
      return emitter.double();
    case 'timestamp':
      return emitter.timestamp();
    case 'string-literal':
      return emitter.stringLiteral(type.value);
    case 'int-literal':
      return emitter.intLiteral(type.value);
    case 'boolean-literal':
      return emitter.booleanLiteral(type.value);
    case 'string-enum':
      return emitter.stringEnum(type.members.map(m => m.value));
    case 'int-enum':
      return emitter.intEnum(type.members.map(m => m.value));
    case 'tuple':
      return emitter.tuple(type.elements.map(el => buildZodFromType(el, emitter)));
    case 'list':
      return emitter.array(buildZodFromType(type.elementType, emitter));
    case 'map':
      return emitter.record(buildZodFromType(type.valueType, emitter));
    case 'object':
      return emitter.object(
        type.fields.map(field => ({
          name: field.name,
          value: buildZodFromType(field.type, emitter),
          optional: field.optional,
        })),
        type.additionalFields
      );
    case 'simple-union':
      return emitter.simpleUnion(type.variants.map(v => buildZodFromType(v, emitter)));
    case 'discriminated-union':
      return emitter.discriminatedUnion(
        type.discriminant,
        type.variants.map(v => buildZodFromType(v, emitter))
      );
    case 'alias':
      return emitter.reference(type.name);
    default:
      assertNever(type);
  }
}

/**
 * A map from model name to its live Zod schema, covering both alias models and
 * document models in the schema.
 */
export type ZodSchemaMap = Map<string, z.ZodTypeAny>;

/**
 * Builds live Zod schemas for every alias and document model in the given Typesync
 * schema. The resulting map is used by `typesync validate-data` to parse documents
 * fetched from Firestore.
 *
 * Mutual recursion between aliases is handled naturally: references are compiled
 * to `z.lazy` so lookups happen at validation time, by which point every model has
 * been registered.
 *
 * @public
 */
export function buildZodSchemaMap(s: schema.Schema): ZodSchemaMap {
  const map: ZodSchemaMap = new Map();
  const registry: RuntimeZodRegistry = { get: name => map.get(name) };
  const emitter = createRuntimeZodEmitter(registry);

  for (const model of s.aliasModels) {
    map.set(model.name, buildZodFromType(model.type, emitter));
  }
  for (const model of s.documentModels) {
    map.set(model.name, buildZodFromType(model.type, emitter));
  }
  return map;
}
