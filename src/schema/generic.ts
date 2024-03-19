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
  fields: ObjectFieldType<T>[];
}

export interface ObjectFieldType<T> {
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
  model: 'alias';
  name: string;
  docs: string | undefined;
  type: T;
  clone(): AliasModel<T>;
}

export interface DocumentModel<T> {
  model: 'document';
  name: string;
  docs: string | undefined;
  type: T;
  clone(): DocumentModel<T>;
}

export type Model<T> = AliasModel<T> | DocumentModel<T>;

export interface Schema<A, D> {
  aliasModels: A[];
  documentModels: D[];
  clone(): Schema<A, D>;
  addModels(...models: (A | D)[]): void;
  addModel(model: A | D): void;
  addAliasModel(model: A): void;
  addDocumentModel(model: D): void;
}
