export class UndefinedValueType {
  public readonly type = 'undefined';
}

export class NoneValueType {
  public readonly type = 'none';
}

export class StringValueType {
  public readonly type = 'string';
}

export class BooleanValueType {
  public readonly type = 'bool';
}

export class IntValueType {
  public readonly type = 'int';
}

export class DatetimeValueType {
  public readonly type = 'datetime';
}

export type PrimitiveValueType =
  | NoneValueType
  | UndefinedValueType
  | StringValueType
  | BooleanValueType
  | IntValueType
  | DatetimeValueType;

export class LiteralValueType {
  public readonly type = 'literal';

  public constructor(public readonly value: string | number | boolean) {}
}

export class TupleValueType {
  public readonly type = 'tuple';

  public constructor(public readonly values: ValueType[]) {}
}

export class ListValueType {
  public readonly type = 'list';

  public constructor(public readonly of: ValueType) {}
}

export class UnionValueType {
  public readonly type = 'union';

  public constructor(public readonly members: ValueType[]) {}

  public addMember(member: ValueType) {
    this.members.push(member);
  }
}

export class AliasValueType {
  public readonly type = 'alias';

  public constructor(public readonly name: string) {}
}

export type ValueType =
  | PrimitiveValueType
  | LiteralValueType
  | TupleValueType
  | ListValueType
  | UnionValueType
  | AliasValueType;

export interface ModelField {
  type: ValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}
