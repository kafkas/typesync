import { assertNever } from '../../util/assert';

export interface Expression {
  content: string;
}

interface PythonType {
  type: string;
  expression: Expression;
}

export class UndefinedValueType implements PythonType {
  public readonly type = 'undefined';

  public readonly expression: Expression = {
    content: 'TypeSyncUndefined',
  };
}

export class NoneValueType implements PythonType {
  public readonly type = 'none';

  public readonly expression: Expression = {
    content: 'None',
  };
}

export class StringValueType implements PythonType {
  public readonly type = 'string';

  public readonly expression: Expression = {
    content: 'str',
  };
}

export class BooleanValueType implements PythonType {
  public readonly type = 'bool';

  public readonly expression: Expression = {
    content: 'bool',
  };
}

export class IntValueType implements PythonType {
  public readonly type = 'int';

  public readonly expression: Expression = {
    content: 'int',
  };
}

export class DatetimeValueType implements PythonType {
  public readonly type = 'datetime';

  public readonly expression: Expression = {
    content: 'datetime.datetime',
  };
}

export type PrimitiveValueType =
  | NoneValueType
  | UndefinedValueType
  | StringValueType
  | BooleanValueType
  | IntValueType
  | DatetimeValueType;

export class LiteralValueType implements PythonType {
  public readonly type = 'literal';

  public get expression(): Expression {
    switch (typeof this.value) {
      case 'string':
        return { content: `typing.Literal["${this.value}"]` };
      case 'number':
        // TODO: Don't allow float literals in the spec
        return { content: `typing.Literal[${this.value}]` };
      case 'boolean':
        return { content: `typing.Literal[${this.value ? 'True' : 'False'}]` };
      default:
        assertNever(this.value);
    }
  }

  public constructor(public readonly value: string | number | boolean) {}
}

export class TupleValueType implements PythonType {
  public readonly type = 'tuple';

  public get expression(): Expression {
    const commaSeparateExpressions = this.values.map(vt => vt.expression.content).join(', ');
    return { content: `tuple[${commaSeparateExpressions}]` };
  }

  public constructor(public readonly values: ValueType[]) {}
}

export class ListValueType implements PythonType {
  public readonly type = 'list';

  public get expression(): Expression {
    const expression = this.of.expression;
    return { content: `typing.list[${expression.content}]` };
  }

  public constructor(public readonly of: ValueType) {}
}

export class UnionValueType implements PythonType {
  public readonly type = 'union';

  public get expression(): Expression {
    const commaSeparateExpressions = this.members.map(vt => vt.expression.content).join(', ');
    return { content: `typing.Union[${commaSeparateExpressions}]` };
  }

  public constructor(public readonly members: ValueType[]) {}

  public addMember(member: ValueType) {
    this.members.push(member);
  }
}

export class AliasValueType implements PythonType {
  public readonly type = 'alias';

  public get expression(): Expression {
    return { content: this.name };
  }

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
