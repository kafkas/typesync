export interface Nil {
  readonly type: 'nil';
}

export interface String {
  readonly type: 'string';
}

export interface Bool {
  readonly type: 'bool';
}

export interface Int {
  readonly type: 'int';
}

export interface Double {
  readonly type: 'double';
}

export interface Date {
  readonly type: 'date';
}

export type Primitive = Nil | String | Bool | Int | Double | Date;

export interface Tuple {
  readonly type: 'tuple';
  readonly elements: Type[];
}

export interface List {
  readonly type: 'list';
  readonly elementType: Type;
}

export interface Dictionary {
  readonly type: 'dictionary';
  readonly valueType: Type;
}

export interface Alias {
  readonly type: 'alias';
  readonly name: string;
}

export type Type = Primitive | Tuple | List | Dictionary | Alias;

export interface StringEnum {
  readonly type: 'string-enum';
  readonly cases: StringEnumCase[];
}

export interface StringEnumCase {
  key: string;
  value: string;
}

export interface IntEnum {
  readonly type: 'int-enum';
  readonly cases: IntEnumCase[];
}

export interface IntEnumCase {
  key: string;
  value: number;
}

export interface Struct {
  readonly type: 'struct';
  readonly properties: StructProperty[];
}

export interface StructProperty {
  type: Type;
  name: string;
  optional: boolean;
  docs: string | undefined;
}
