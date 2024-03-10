import type { PrimitiveValueType, ValueType } from './types';

export function isPrimitiveValueType(pyType: ValueType): pyType is PrimitiveValueType {
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
