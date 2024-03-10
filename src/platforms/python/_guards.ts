import type { PrimitiveType, Type } from './_types';

export function isPrimitiveType(pyType: Type): pyType is PrimitiveType {
  switch (pyType.type) {
    case 'undefined':
    case 'none':
    case 'string':
    case 'bool':
    case 'datetime':
    case 'int':
      return true;
    default:
      return false;
  }
}
