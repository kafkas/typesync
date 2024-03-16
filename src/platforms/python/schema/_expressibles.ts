import { schema } from '../../../schema';

export interface ExpressibleTupleType extends schema.types.Tuple {
  values: ExpressibleType[];
}

export interface ExpressibleListType extends schema.types.List {
  of: ExpressibleType;
}

export interface ExpressibleUnionType extends schema.types.Union {
  members: ExpressibleType[];
}

export type ExpressibleType =
  | schema.types.Primitive
  | schema.types.Literal
  | ExpressibleTupleType
  | ExpressibleListType
  | ExpressibleUnionType
  | schema.types.Alias;

export interface ExpressibleFieldType extends schema.types.Field {
  type: ExpressibleType;
}

export interface ExpressibleDocumentModel extends schema.DocumentModel {
  fields: ExpressibleFieldType[];
}

export interface FlatMapType extends schema.types.Map {
  fields: FlatMapModelFieldType[];
}

export interface FlatMapModelFieldType extends schema.types.Field {
  type: schema.types.Type;
}

export interface ExpressibleAliasModel extends schema.AliasModel {
  value:
    | schema.types.Primitive
    | schema.types.Literal
    | schema.types.Enum
    | ExpressibleTupleType
    | ExpressibleListType
    | FlatMapType
    | ExpressibleUnionType
    | schema.types.Alias;
}

export type ExpressibleModel = ExpressibleDocumentModel | ExpressibleAliasModel;

export interface ExpressibleSchema {
  aliasModels: ExpressibleAliasModel[];
  documentModels: ExpressibleDocumentModel[];
  clone(): ExpressibleSchema;
  addModels(...models: ExpressibleModel[]): void;
  addModel(model: ExpressibleModel): void;
  addAliasModel(model: ExpressibleAliasModel): void;
  addDocumentModel(model: ExpressibleDocumentModel): void;
}
