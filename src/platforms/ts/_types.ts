export interface Unknown {
  readonly type: 'unknown';
}

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

export type Primitive = Unknown | Null | String | Boolean | Number | Timestamp;

export interface Literal {
  readonly type: 'literal';
  readonly value: string | number | boolean;
}

export interface Enum {
  readonly type: 'enum';
  readonly members: {
    label: string;
    value: string | number;
  }[];
}

export interface Tuple {
  readonly type: 'tuple';
  readonly elements: Type[];
}

export interface List {
  readonly type: 'list';
  readonly elementType: Type;
}

export interface Record {
  readonly type: 'record';
  readonly valueType: Type;
}

export interface Object {
  readonly type: 'object';
  readonly properties: ObjectProperty[];
}

export interface ObjectProperty {
  readonly type: Type;
  readonly optional: boolean;
  readonly name: string;
  readonly docs: string | undefined;
}

export interface Union {
  readonly type: 'union';
  readonly variants: Type[];
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Literal | Enum | Tuple | List | Record | Object | Union | Alias;
