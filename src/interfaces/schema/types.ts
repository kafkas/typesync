export type PrimitiveValueType = {
  type: 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';
};

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

export type ListValueType = {
  type: 'list';
  of: ValueType;
};

export type MapValueType = {
  type: 'map';
  fields: ModelField[];
};

export type UnionValueType = {
  type: 'union';
  members: ValueType[];
};

export type AliasValueType = {
  type: 'alias';
  name: string;
};

export type ValueType =
  | PrimitiveValueType
  | LiteralValueType
  | EnumValueType
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
