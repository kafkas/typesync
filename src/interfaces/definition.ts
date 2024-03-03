export type DefPrimitiveValueType = 'string' | 'boolean' | 'int';

export interface DefEnumValueType {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
}

export type DefComplexValueType = DefEnumValueType;

export type DefValueType = DefPrimitiveValueType | DefComplexValueType;

export interface DefModelField {
  type: DefValueType;
  optional?: boolean;
  docs?: string;
}

export interface DefDocumentModel {
  type: 'document';
  docs?: string;
  fields: Record<string, DefModelField>;
}

export interface DefAliasModel {
  type: 'alias';
  docs?: string;
  value: DefValueType;
}

export type DefModel = DefDocumentModel | DefAliasModel;

export type Definition = Record<string, DefModel>;
