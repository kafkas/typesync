import { assertNever } from '../../util/assert';
import type { ExpressibleValueType, PrimitiveValueType, ValueType } from './types';

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

export function isExpressibleValueType(pyType: ValueType): pyType is ExpressibleValueType {
  if (isPrimitiveValueType(pyType)) {
    return true;
  }
  switch (pyType.type) {
    case 'literal':
    case 'tuple':
    case 'list':
    case 'union':
    case 'alias':
      return true;
    case 'enum':
    case 'map':
      return false;
    default:
      assertNever(pyType);
  }
}
