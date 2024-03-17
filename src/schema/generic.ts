export interface TupleType<T> {
  type: 'tuple';
  values: T[];
}

export interface ListType<T> {
  type: 'list';
  of: T;
}

export interface ObjectType<T> {
  type: 'object';
  fields: FieldType<T>[];
}

export interface FieldType<T> {
  type: T;
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface UnionType<T> {
  type: 'union';
  members: T[];
}

export interface AliasModel<T> {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: T;
  clone(): AliasModel<T>;
}

export interface DocumentModel<T, F extends FieldType<T>> {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: F[];
  clone(): DocumentModel<T, F>;
}

export type Model<T, F extends FieldType<T>> = AliasModel<T> | DocumentModel<T, F>;

export interface Schema<A, D> {
  aliasModels: A[];
  documentModels: D[];
  clone(): Schema<A, D>;
  addModels(...models: (A | D)[]): void;
  addModel(model: A | D): void;
  addAliasModel(model: A): void;
  addDocumentModel(model: D): void;
}
