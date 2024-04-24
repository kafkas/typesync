import { assertNever } from '../../util/assert.js';
import type { Primitive, Type } from './_types.js';

export function isPrimitiveType(t: Type): t is Primitive {
  switch (t.type) {
    case 'nil':
    case 'string':
    case 'bool':
    case 'int':
    case 'double':
    case 'date':
      return true;
    case 'tuple':
    case 'list':
    case 'dictionary':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
