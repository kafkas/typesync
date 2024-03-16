import { assertNever } from '../../util/assert';
import type { PrimitiveType, Type } from './_types';

export function isPrimitiveType(t: Type): t is PrimitiveType {
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
    case 'object':
    case 'union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
