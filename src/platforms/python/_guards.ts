import { assertNever } from '../../util/assert';
import type { Primitive, Type } from './_types';

export function isPrimitiveType(t: Type): t is Primitive {
  switch (t.type) {
    case 'undefined':
    case 'none':
    case 'str':
    case 'bool':
    case 'datetime':
    case 'int':
      return true;
    case 'literal':
    case 'tuple':
    case 'list':
    case 'union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
