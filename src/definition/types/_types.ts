export type Any = 'any';

export type Unknown = 'unknown';

export type Nil = 'nil';

export type String = 'string';

export type Boolean = 'boolean';

export type Int = 'int';

export type Double = 'double';

export type Timestamp = 'timestamp';

export type Primitive = Any | Unknown | Nil | String | Boolean | Int | Double | Timestamp;

export interface StringLiteral {
  type: 'literal';
  value: string;
}

export interface IntLiteral {
  type: 'literal';
  value: number;
}

export interface BooleanLiteral {
  type: 'literal';
  value: boolean;
}

export type Literal = StringLiteral | IntLiteral | BooleanLiteral;

export interface StringEnum {
  type: 'enum';
  members: StringEnumMember[];
}

export interface StringEnumMember {
  label: string;
  value: string;
}

export interface IntEnum {
  type: 'enum';
  members: IntEnumMember[];
}

export interface IntEnumMember {
  label: string;
  value: number;
}

export type Enum = StringEnum | IntEnum;

export interface Tuple {
  type: 'tuple';
  elements: Type[];
}

export interface List {
  type: 'list';
  elementType: Type;
}

export interface Map {
  type: 'map';
  valueType: Type;
}

export interface Object {
  type: 'object';
  fields: Record<string, ObjectField>;
  additionalFields?: boolean;
}

export interface ObjectField {
  type: Type;
  optional?: boolean;
  readonly?: boolean;
  docs?: string;
  swift?: SwiftFieldOptions;
}

/**
 * Swift-specific overrides for an object field. Only consumed by the Swift
 * generator; ignored by every other generator.
 */
export interface SwiftFieldOptions {
  /**
   * Overrides the Swift property name used to decode this field.
   *
   * Encoding is unaffected: the field is still serialized to Firestore under
   * the schema's field name (the Swift renderer routes the original name
   * through `CodingKeys`). Useful when the schema name collides with a Swift
   * keyword or with an auto-generated property such as `@DocumentID var id`.
   */
  name?: string;
}

export interface DiscriminatedUnion {
  type: 'union';
  discriminant: string;
  variants: (Object | Alias)[];
}

export interface SimpleUnion {
  type: 'union';
  variants: Type[];
}

export type Union = DiscriminatedUnion | SimpleUnion;

export type Alias = string;

export type Type = Primitive | Literal | Enum | Tuple | List | Map | Object | Union | Alias;
