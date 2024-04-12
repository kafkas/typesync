import type {
  DiscriminatedUnionType,
  ListType,
  MapType,
  ObjectFieldType,
  ObjectType,
  SimpleUnionType,
  TupleType,
} from '../generic.js';

export interface Nil {
  type: 'nil';
}

export interface String {
  type: 'string';
}

export interface Boolean {
  type: 'boolean';
}

export interface Integer {
  type: 'int';
}

export interface Double {
  type: 'double';
}

export interface Timestamp {
  type: 'timestamp';
}

export type Primitive = Nil | String | Boolean | Integer | Double | Timestamp;

export interface Literal {
  type: 'literal';
  value: string | number | boolean;
}

export interface Enum {
  type: 'enum';
  members: {
    label: string;
    value: string | number;
  }[];
}

export type Tuple = TupleType<Type>;

export type List = ListType<Type>;

export type Map = MapType<Type>;

export type Object = ObjectType<Type>;

export type ObjectField = ObjectFieldType<Type>;

export type DiscriminatedUnion = DiscriminatedUnionType<Object | Alias>;

export type SimpleUnion = SimpleUnionType<Type>;

export type Union = DiscriminatedUnion | SimpleUnion;

export interface Alias {
  type: 'alias';
  name: string;
}

export type Type = Primitive | Literal | Enum | Tuple | List | Map | Object | Union | Alias;
