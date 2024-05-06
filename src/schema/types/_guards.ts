import { assertNever } from '../../util/assert.js';
import type { Primitive, Type } from './_types.js';

export function isPrimitive(t: Type): t is Primitive {
  switch (t.type) {
    case 'unknown':
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'timestamp':
      return true;
    case 'literal':
    case 'enum':
    case 'tuple':
    case 'list':
    case 'map':
    case 'object':
    case 'discriminated-union':
    case 'simple-union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
