export interface TupleType<T> {
  type: 'tuple';
  elements: T[];
}

export interface ListType<T> {
  type: 'list';
  elementType: T;
}

export interface MapType<T> {
  type: 'map';
  valueType: T;
}

export interface ObjectType<F extends ObjectFieldType<unknown>> {
  type: 'object';
  fields: F[];
  additionalFields: boolean;
}

export interface ObjectFieldType<T> {
  type: T;
  optional: boolean;
  name: string;
  docs: string | null;
}

export interface DiscriminatedUnionType<T> {
  type: 'discriminated-union';
  discriminant: string;
  variants: T[];
}

export interface SimpleUnionType<T> {
  type: 'simple-union';
  variants: T[];
}

export interface AliasModel<T> {
  model: 'alias';
  name: string;
  docs: string | null;
  type: T;
  clone(): AliasModel<T>;
}

export interface DocumentModel<T> {
  model: 'document';
  name: string;
  docs: string | null;
  type: T;
  clone(): DocumentModel<T>;
}

export type Model<T> = AliasModel<T> | DocumentModel<T>;

export interface Schema<A, D> {
  aliasModels: A[];
  documentModels: D[];
  clone(): Schema<A, D>;
  /**
   * Similar to adding models to the schema one by one, with an important difference. Models are validated only
   * after the entire "group" has been added to the schema. This makes sure that the validation code doesn't fail
   * because of missing models.
   */
  addModelGroup(models: (A | D)[]): void;
  addModel(model: A | D): void;
  getAliasModel(modelName: string): A | undefined;
}
