export type Primitive = 'unknown' | 'nil' | 'string' | 'boolean' | 'int' | 'double' | 'timestamp';

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
}

export interface ObjectField {
  type: Type;
  optional?: boolean;
  docs?: string;
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
