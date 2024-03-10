export type PrimitiveValueType = 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';

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
  fields: Record<string, ModelField>;
}

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

export interface ModelField {
  type: ValueType;
  optional?: boolean;
  docs?: string;
}

export interface DocumentModel {
  type: 'document';
  docs?: string;
  fields: Record<string, ModelField>;
}

export interface AliasModel {
  type: 'alias';
  docs?: string;
  value: ValueType;
}

export type Model = DocumentModel | AliasModel;

export type Definition = Record<string, Model>;
