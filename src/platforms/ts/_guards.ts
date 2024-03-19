import { assertNever } from '../../util/assert';
import type { Primitive, Type } from './_types';

export function isPrimitiveType(t: Type): t is Primitive {
  switch (t.type) {
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
