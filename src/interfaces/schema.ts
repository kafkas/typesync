export type SchemaPrimitiveValueType = {
  type: 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';
};

export type SchemaLiteralValueType = {
  type: 'literal';
  value: string | number | boolean;
};

export type SchemaEnumValueType = {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
};

export type SchemaMapValueType = {
  type: 'map';
  fields: SchemaModelField[];
};

export type SchemaUnionValueType = {
  type: 'union';
  members: SchemaValueType[];
};

export type SchemaAliasValueType = {
  type: 'alias';
  name: string;
};

export type SchemaValueType =
  | SchemaPrimitiveValueType
  | SchemaLiteralValueType
  | SchemaEnumValueType
  | SchemaMapValueType
  | SchemaUnionValueType
  | SchemaAliasValueType;

export interface SchemaModelField {
  type: SchemaValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface SchemaDocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: SchemaModelField[];
}

export interface SchemaAliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: SchemaValueType;
}

export type SchemaModel = SchemaDocumentModel | SchemaAliasModel;

export interface Schema {
  models: SchemaModel[];
}
