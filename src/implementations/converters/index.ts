import type { DefValueType } from '../../definition';
import type { SchemaValueType } from '../../interfaces';

export function convertDefValueTypeToSchemaValueType(defValueType: DefValueType): SchemaValueType {
  switch (defValueType) {
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
    case 'timestamp':
      return { type: 'timestamp' };
  }

  if (typeof defValueType === 'string') {
    return { type: 'alias', name: defValueType };
  }

  switch (defValueType.type) {
    case 'enum': {
      return {
        type: 'enum',
        items: defValueType.items,
      };
    }
  }
}
