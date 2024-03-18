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

export interface Object {
  type: 'object';
  fields: Record<string, ObjectField>;
}

export interface ObjectField {
  type: Type;
  optional?: boolean;
  docs?: string;
}

export type Union = Type[];

export type Alias = string;

export type Type = Primitive | Literal | Enum | Tuple | List | Object | Union | Alias;
