export type Primitive = 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';

export interface Literal {
  type: 'literal';
  value: string | number | boolean;
}

export interface Enum {
  type: 'enum';
  items: {
    label: string;
    value: string | number;
  }[];
}

export interface Tuple {
  type: 'tuple';
  values: Type[];
}

export interface List {
  type: 'list';
  of: Type;
}

export interface Map {
  type: 'map';
  fields: Record<string, Field>;
}

export interface Field {
  type: Type;
  optional?: boolean;
  docs?: string;
}

export type Union = Type[];

export type Alias = string;

export type Type = Primitive | Literal | Enum | Tuple | List | Map | Union | Alias;