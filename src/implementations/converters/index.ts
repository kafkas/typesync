import type { DefValueType, SchemaValueType } from '../../interfaces';

export function convertDefValueTypeToSchemaValueType(defValueType: DefValueType): SchemaValueType {
  switch (defValueType) {
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
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
