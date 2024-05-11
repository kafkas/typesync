import { assertNever } from '../../util/assert.js';
import type { Primitive, Type } from './_types.js';

export function isPrimitiveType(t: Type): t is Primitive {
  switch (t.type) {
    case 'any':
    case 'unknown':
    case 'null':
    case 'string':
    case 'boolean':
    case 'number':
    case 'timestamp':
      return true;
    case 'literal':
    case 'enum':
    case 'tuple':
    case 'list':
    case 'record':
    case 'object':
    case 'union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
