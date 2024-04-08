import { assertNever } from '../../util/assert.js';
import type { Primitive, Type } from './_types.js';

export function isPrimitiveType(t: Type): t is Primitive {
  switch (t.type) {
    case 'undefined':
    case 'none':
    case 'str':
    case 'bool':
    case 'datetime':
    case 'int':
    case 'float':
      return true;
    case 'literal':
    case 'tuple':
    case 'list':
    case 'dict':
    case 'discriminated-union':
    case 'simple-union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
