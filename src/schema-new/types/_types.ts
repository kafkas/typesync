import type {
  DiscriminatedUnionType,
  ListType,
  MapType,
  ObjectFieldType,
  ObjectType,
  SimpleUnionType,
  TupleType,
} from '../generic.js';

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

export type Primitive = Unknown | Nil | String | Boolean | Int | Double | Timestamp;

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

export type Tuple = TupleType<Type>;

export type List = ListType<Type>;

export type Map = MapType<Type>;

// TODO: Confirm. This was previously ObjectType<Type>
export type Object = ObjectType<ObjectField>;

export interface Alias {
  type: 'alias';
  name: string;
}

export type DiscriminatedUnion = DiscriminatedUnionType<Object | Alias>;

export type SimpleUnion = SimpleUnionType<Type>;

export type Union = DiscriminatedUnion | SimpleUnion;

export type Type = Primitive | Literal | Enum | Tuple | List | Map | Object | Union | Alias;

export type ObjectField = ObjectFieldType<Type>;