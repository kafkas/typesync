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
  readonly: boolean;
  name: string;
  docs: string | null;
  /**
   * Per-platform overrides carried through from the definition layer.
   * Optional because most fields don't need any overrides; absence is
   * equivalent to an empty record. Each generator reads only the slot it
   * cares about (the Swift generator reads `swift`, etc.).
   */
  platformOptions?: PlatformFieldOptions;
}

/**
 * Open record of per-platform overrides on an `ObjectField`. Each platform
 * narrows this when specializing the generic schema namespace.
 */
export interface PlatformFieldOptions {
  swift?: SwiftFieldOptions;
}

export interface SwiftFieldOptions {
  /** Overrides the Swift property name used to decode this field. */
  name?: string;
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
  path: string;
  /**
   * Per-platform overrides carried through from the definition layer. Each
   * generator reads only the slot it cares about (the Swift generator reads
   * `swift`, etc.).
   */
  platformOptions?: PlatformDocumentModelOptions;
  clone(): DocumentModel<T>;
}

/**
 * Open record of per-platform overrides on a `DocumentModel`.
 */
export interface PlatformDocumentModelOptions {
  swift?: SwiftDocumentModelOptions;
}

export interface SwiftDocumentModelOptions {
  /**
   * Overrides for the auto-generated `@DocumentID` property emitted on every
   * document-model struct.
   */
  documentIdProperty?: {
    /** Swift property name. Defaults to `id`. */
    name: string;
  };
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
