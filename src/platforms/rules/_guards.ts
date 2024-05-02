import { assertNever } from '../../util/assert.js';
import type { RulesDataType, Type } from './_types.js';

export function isRulesDataType(t: Type): t is RulesDataType {
  switch (t.type) {
    case 'string':
    case 'bool':
    case 'float':
    case 'int':
    case 'timestamp':
    case 'list':
    case 'map':
      return true;
    case 'enum':
    case 'object':
    case 'any':
    case 'literal':
    case 'tuple':
    case 'discriminated-union':
    case 'simple-union':
    case 'alias':
      return false;
    default:
      assertNever(t);
  }
}
