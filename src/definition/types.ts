export type DefPrimitiveValueType = 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';

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

export type DefValueType = string | DefEnumValueType | DefMapValueType | DefUnionValueType;

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
