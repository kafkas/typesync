import type { PrimitiveValueType, ValueType } from './types';

export function isPrimitiveValueType(valueType: ValueType): valueType is PrimitiveValueType {
  switch (valueType.type) {
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'timestamp':
      return true;
    default:
      return false;
  }
}
