export interface Undefined {
  readonly type: 'undefined';
}

export interface Any {
  readonly type: 'any';
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

export interface Float {
  readonly type: 'float';
}

export interface Datetime {
  readonly type: 'datetime';
}

export type Primitive = Undefined | Any | None | Str | Bool | Int | Float | Datetime;

export interface Literal {
  readonly type: 'literal';
  readonly value: string | number | boolean;
}

export interface Tuple {
  readonly type: 'tuple';
  readonly elements: Type[];
}

export interface List {
  readonly type: 'list';
  readonly elementType: Type;
}

export interface Dict {
  readonly type: 'dict';
  readonly valueType: Type;
}

export interface DiscriminatedUnion {
  readonly type: 'discriminated-union';
  readonly discriminant: string;
  readonly variants: Alias[];
}

export interface SimpleUnion {
  readonly type: 'simple-union';
  readonly variants: Type[];
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Literal | Tuple | List | Dict | DiscriminatedUnion | SimpleUnion | Alias;

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
  readonly additionalAttributes: boolean;
}

export interface ObjectClassAttribute {
  type: Type;
  name: string;
  optional: boolean;
  docs: string | undefined;
}
