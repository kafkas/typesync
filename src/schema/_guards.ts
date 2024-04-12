import { assertNever } from '../util/assert.js';
import type { types } from './types/index.js';

export function isPrimitiveType(t: types.Type): t is types.Primitive {
  switch (t.type) {
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
