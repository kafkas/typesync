export interface Any {
  readonly type: 'any';
}

export interface String {
  readonly type: 'string';
}

export interface Bool {
  readonly type: 'bool';
}

export interface Float {
  readonly type: 'float';
}

export interface Int {
  readonly type: 'int';
}

export interface Timestamp {
  readonly type: 'timestamp';
}

export type Primitive = Any | String | Bool | Float | Int | Timestamp;

export interface Literal {
  readonly type: 'literal';
  readonly value: string | number | boolean;
}

export interface Enum {
  readonly type: 'enum';
  readonly members: {
    value: string | number;
  }[];
}

export interface Tuple {
  readonly type: 'tuple';
  readonly elements: Type[];
}

export interface List {
  readonly type: 'list';
}

export interface Map {
  readonly type: 'map';
}

export interface Object {
  readonly type: 'object';
  readonly fields: ObjectField[];
  readonly additionalFields: boolean;
}

export interface ObjectField {
  readonly type: Type;
  readonly optional: boolean;
  readonly name: string;
}

export interface DiscriminatedUnion {
  readonly type: 'discriminated-union';
  readonly discriminant: string;
  readonly variants: (Object | Alias)[];
}

export interface SimpleUnion {
  readonly type: 'simple-union';
  readonly variants: Type[];
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Literal | Enum | Tuple | List | Map | Object | DiscriminatedUnion | SimpleUnion | Alias;

export type RulesDataType = String | Bool | Float | Int | Timestamp | List | Map;
