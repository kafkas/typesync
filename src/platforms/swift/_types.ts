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
  readonly key: string;
  readonly value: string;
}

export interface IntEnum {
  readonly type: 'int-enum';
  readonly cases: IntEnumCase[];
}

export interface IntEnumCase {
  readonly key: string;
  readonly value: number;
}

export interface DiscriminatedUnionEnum {
  readonly type: 'discriminated-union-enum';
  readonly discriminant: string;
  readonly values: DiscriminatedUnionEnumCase[];
}

export interface DiscriminatedUnionEnumCase {
  readonly discriminantValue: string;
  readonly structName: string;
}

export interface SimpleUnionEnum {
  readonly type: 'simple-union-enum';
  readonly values: SimpleUnionEnumCase[];
}

export interface SimpleUnionEnumCase {
  readonly type: Type;
}

export interface Struct {
  readonly type: 'struct';
  readonly literalProperties: LiteralStructProperty[];
  readonly regularProperties: RegularStructProperty[];
}

export interface LiteralStructProperty {
  readonly originalName: string;
  readonly docs: string | undefined;
  readonly type: String | Bool | Int;
  readonly literalValue: string;
}

export interface RegularStructProperty {
  readonly originalName: string;
  readonly optional: boolean;
  readonly docs: string | undefined;
  readonly type: Type;
}
