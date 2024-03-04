export type DefPrimitiveValueType = 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';

export type DefLiteralValueType = {
  type: 'literal';
  value: string | number | boolean;
};

export type DefEnumValueType = {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
};

export type DefMapValueType = {
  type: 'map';
  fields: Record<string, DefModelField>;
};

export type DefUnionValueType = DefValueType[];

export type DefAliasValueType = string;

export type DefValueType =
  | DefPrimitiveValueType
  | DefLiteralValueType
  | DefEnumValueType
  | DefMapValueType
  | DefUnionValueType
  | DefAliasValueType;

export type DefModelField = {
  type: DefValueType;
  optional?: boolean;
  docs?: string;
};

export type DefDocumentModel = {
  type: 'document';
  docs?: string;
  fields: Record<string, DefModelField>;
};

export type DefAliasModel = {
  type: 'alias';
  docs?: string;
  value: DefValueType;
};

export type DefModel = DefDocumentModel | DefAliasModel;

export type Definition = Record<string, DefModel>;
