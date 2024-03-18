export interface Null {
  readonly type: 'null';
}

export interface String {
  readonly type: 'string';
}

export interface Boolean {
  readonly type: 'boolean';
}

export interface Number {
  readonly type: 'number';
}

export interface Timestamp {
  readonly type: 'timestamp';
}

export type Primitive = Null | String | Boolean | Number | Timestamp;

export interface Literal {
  readonly type: 'literal';
  readonly value: string | number | boolean;
}

export interface Enum {
  readonly type: 'enum';
  readonly items: {
    label: string;
    value: string | number;
  }[];
}

export interface Tuple {
  readonly type: 'tuple';
  readonly values: Type[];
}

export interface List {
  readonly type: 'list';
  readonly of: Type;
}

export interface Object {
  readonly type: 'object';
  readonly fields: ObjectField[];
}

export interface ObjectField {
  readonly type: Type;
  readonly optional: boolean;
  readonly name: string;
  readonly docs: string | undefined;
}

export interface Union {
  readonly type: 'union';
  readonly members: Type[];
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Literal | Enum | Tuple | List | Object | Union | Alias;
