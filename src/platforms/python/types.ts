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

interface EnumItem {
  label: string;
  value: string | number;
}

export class EnumValueType {
  public readonly type = 'enum';

  public constructor(
    public readonly name: string,
    public readonly items: EnumItem[]
  ) {}
}

export class TupleValueType {
  public readonly type = 'tuple';

  public constructor(public readonly values: ExpressibleValueType[]) {}
}

export class ListValueType {
  public readonly type = 'list';

  public constructor(public readonly of: ExpressibleValueType) {}
}

export class MapValueType {
  public readonly type = 'map';

  public constructor(public readonly fields: ModelField[]) {}
}

export class UnionValueType {
  public readonly type = 'union';

  public constructor(public readonly members: ExpressibleValueType[]) {}

  public addMember(member: ExpressibleValueType) {
    this.members.push(member);
  }
}

export class AliasValueType {
  public readonly type = 'alias';

  public constructor(public readonly name: string) {}
}

export type ExpressibleValueType =
  | PrimitiveValueType
  | LiteralValueType
  | TupleValueType
  | ListValueType
  | UnionValueType
  | AliasValueType;

export type ValueType = ExpressibleValueType | EnumValueType | MapValueType;

export interface ModelField {
  type: ExpressibleValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}
