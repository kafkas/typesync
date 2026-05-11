import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

/**
 * Recursively checks whether the given Typesync type tree contains a node of
 * the specified primitive `kind`. Used by the Zod generator to decide whether
 * the rendered file needs to import the Firestore SDK at all.
 *
 * Alias references are intentionally not followed: each alias model's own type
 * is walked separately by the caller, so any `timestamp`/`bytes` usage is
 * eventually visited at its definition site regardless of how many references
 * point at it.
 */
function typeContains(type: schema.types.Type, kind: 'timestamp' | 'bytes'): boolean {
  switch (type.type) {
    case 'any':
    case 'unknown':
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'string-literal':
    case 'int-literal':
    case 'boolean-literal':
    case 'string-enum':
    case 'int-enum':
    case 'alias':
      return false;
    case 'timestamp':
      return kind === 'timestamp';
    case 'bytes':
      return kind === 'bytes';
    case 'tuple':
      return type.elements.some(el => typeContains(el, kind));
    case 'list':
      return typeContains(type.elementType, kind);
    case 'map':
      return typeContains(type.valueType, kind);
    case 'object':
      return type.fields.some(f => typeContains(f.type, kind));
    case 'simple-union':
      return type.variants.some(v => typeContains(v, kind));
    case 'discriminated-union':
      return type.variants.some(v => typeContains(v, kind));
    default:
      assertNever(type);
  }
}

export function typeUsesTimestamp(type: schema.types.Type): boolean {
  return typeContains(type, 'timestamp');
}

export function typeUsesBytes(type: schema.types.Type): boolean {
  return typeContains(type, 'bytes');
}
