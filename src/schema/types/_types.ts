export interface Primitive {
  type: 'nil' | 'string' | 'boolean' | 'int' | 'timestamp';
}

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
  fields: Field[];
}

export interface Field {
  type: Type;
  optional: boolean;
  name: string;
  docs: string | undefined;
}

export interface Union {
  type: 'union';
  members: Type[];
}

export interface Alias {
  type: 'alias';
  name: string;
}

export type Type = Primitive | Literal | Enum | Tuple | List | Object | Union | Alias;
