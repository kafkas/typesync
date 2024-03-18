export interface Undefined {
  readonly type: 'undefined';
}

export interface None {
  readonly type: 'none';
}

export interface Str {
  readonly type: 'str';
}

export interface Bool {
  readonly type: 'bool';
}

export interface Int {
  readonly type: 'int';
}

export interface Datetime {
  readonly type: 'datetime';
}

export type Primitive = None | Undefined | Str | Bool | Int | Datetime;

export interface Literal {
  readonly type: 'literal';
  readonly value: string | number | boolean;
}

export interface Tuple {
  readonly type: 'tuple';
  readonly values: Type[];
}

export interface List {
  readonly type: 'list';
  readonly of: Type;
}

export interface Union {
  readonly type: 'union';
  readonly members: Type[];
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Literal | Tuple | List | Union | Alias;

export interface EnumClass {
  readonly type: 'enum-class';
  readonly attributes: EnumClassAttribute[];
}

export interface EnumClassAttribute {
  key: string;
  value: string | number;
}

export interface ObjectClass {
  readonly type: 'object-class';
  readonly attributes: ObjectClassAttribute[];
}

export interface ObjectClassAttribute {
  type: Type;
  name: string;
  optional?: boolean;
  docs?: string;
}
