export interface PrimitiveValueType {
  type: 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';
}

export interface LiteralValueType {
  type: 'literal';
  value: string | number | boolean;
}

export interface EnumValueType {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
}

export interface TupleValueType {
  type: 'tuple';
  values: ValueType[];
}

export interface ListValueType {
  type: 'list';
  of: ValueType;
}

export interface MapValueType {
  type: 'map';
  fields: ModelField[];
}

export interface UnionValueType {
  type: 'union';
  members: ValueType[];
}

export interface AliasValueType {
  type: 'alias';
  name: string;
}

export type ValueType =
  | PrimitiveValueType
  | LiteralValueType
  | EnumValueType
  | TupleValueType
  | ListValueType
  | MapValueType
  | UnionValueType
  | AliasValueType;

export interface ModelField {
  type: ValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface DocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: ModelField[];
}

export interface AliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: ValueType;
}

export type Model = DocumentModel | AliasModel;

export interface Schema {
  models: Model[];
}
