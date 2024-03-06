export type PrimitiveValueType = 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';

export type LiteralValueType = {
  type: 'literal';
  value: string | number | boolean;
};

export type EnumValueType = {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
};

export type TupleValueType = {
  type: 'tuple';
  values: ValueType[];
};

export type ListValueType = {
  type: 'list';
  of: ValueType;
};

export type MapValueType = {
  type: 'map';
  fields: Record<string, ModelField>;
};

export type UnionValueType = ValueType[];

export type AliasValueType = string;

export type ValueType =
  | PrimitiveValueType
  | LiteralValueType
  | EnumValueType
  | TupleValueType
  | ListValueType
  | MapValueType
  | UnionValueType
  | AliasValueType;

export type ModelField = {
  type: ValueType;
  optional?: boolean;
  docs?: string;
};

export type DocumentModel = {
  type: 'document';
  docs?: string;
  fields: Record<string, ModelField>;
};

export type AliasModel = {
  type: 'alias';
  docs?: string;
  value: ValueType;
};

export type Model = DocumentModel | AliasModel;

export type Definition = Record<string, Model>;
