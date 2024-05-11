/*
 * Models
 */

export interface Any {
  type: 'any';
}

export interface Unknown {
  type: 'unknown';
}

export interface Nil {
  type: 'nil';
}

export interface String {
  type: 'string';
}

export interface Boolean {
  type: 'boolean';
}

export interface Int {
  type: 'int';
}

export interface Double {
  type: 'double';
}

export interface Timestamp {
  type: 'timestamp';
}

export type Primitive = Any | Unknown | Nil | String | Boolean | Int | Double | Timestamp;

export interface StringLiteral {
  type: 'string-literal';
  value: string;
}

export interface IntLiteral {
  type: 'int-literal';
  value: number;
}

export interface BooleanLiteral {
  type: 'boolean-literal';
  value: boolean;
}

export type Literal = StringLiteral | IntLiteral | BooleanLiteral;

export interface StringEnumMember {
  label: string;
  value: string;
}

export interface StringEnum {
  type: 'string-enum';
  members: StringEnumMember[];
}

export interface IntEnumMember {
  label: string;
  value: number;
}

export interface IntEnum {
  type: 'int-enum';
  members: IntEnumMember[];
}

export type Enum = StringEnum | IntEnum;

export interface Tuple<T> {
  type: 'tuple';
  elements: T[];
}

export interface List<T> {
  type: 'list';
  elementType: T;
}

export interface Map<T> {
  type: 'map';
  valueType: T;
}

export interface Object<F extends ObjectField<unknown>> {
  type: 'object';
  fields: F[];
  additionalFields: boolean;
}

export interface ObjectField<T> {
  type: T;
  optional: boolean;
  name: string;
  docs: string | null;
}

export interface Alias {
  type: 'alias';
  name: string;
}

export interface DiscriminatedUnion<T> {
  type: 'discriminated-union';
  discriminant: string;
  variants: T[];
}

export interface SimpleUnion<T> {
  type: 'simple-union';
  variants: T[];
}

export type Type<T> =
  | Primitive
  | Literal
  | Enum
  | Tuple<T>
  | List<T>
  | Map<T>
  | Object<ObjectField<T>>
  | DiscriminatedUnion<T>
  | SimpleUnion<T>
  | Alias;

/*
 * Models
 */

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
  validateType(type: unknown): void;
}
