import { assertNever } from '../../util/assert';

export interface Expression {
  content: string;
}

interface PythonType {
  type: string;
  expression: Expression;
}

export class UndefinedType implements PythonType {
  public readonly type = 'undefined';

  public readonly expression: Expression = {
    content: 'TypeSyncUndefined',
  };
}

export class NoneType implements PythonType {
  public readonly type = 'none';

  public readonly expression: Expression = {
    content: 'None',
  };
}

export class StringType implements PythonType {
  public readonly type = 'string';

  public readonly expression: Expression = {
    content: 'str',
  };
}

export class BooleanType implements PythonType {
  public readonly type = 'bool';

  public readonly expression: Expression = {
    content: 'bool',
  };
}

export class IntType implements PythonType {
  public readonly type = 'int';

  public readonly expression: Expression = {
    content: 'int',
  };
}

export class DatetimeType implements PythonType {
  public readonly type = 'datetime';

  public readonly expression: Expression = {
    content: 'datetime.datetime',
  };
}

export type PrimitiveType = NoneType | UndefinedType | StringType | BooleanType | IntType | DatetimeType;

export class LiteralType implements PythonType {
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

export class TupleType implements PythonType {
  public readonly type = 'tuple';

  public get expression(): Expression {
    const commaSeparateExpressions = this.values.map(vt => vt.expression.content).join(', ');
    return { content: `tuple[${commaSeparateExpressions}]` };
  }

  public constructor(public readonly values: Type[]) {}
}

export class ListType implements PythonType {
  public readonly type = 'list';

  public get expression(): Expression {
    const expression = this.of.expression;
    return { content: `typing.list[${expression.content}]` };
  }

  public constructor(public readonly of: Type) {}
}

export class UnionType implements PythonType {
  public readonly type = 'union';

  public get expression(): Expression {
    const commaSeparateExpressions = this.members.map(vt => vt.expression.content).join(', ');
    return { content: `typing.Union[${commaSeparateExpressions}]` };
  }

  public constructor(public readonly members: Type[]) {}

  public addMember(member: Type) {
    this.members.push(member);
  }
}

export class AliasType implements PythonType {
  public readonly type = 'alias';

  public get expression(): Expression {
    return { content: this.name };
  }

  public constructor(public readonly name: string) {}
}

export type Type = PrimitiveType | LiteralType | TupleType | ListType | UnionType | AliasType;

export interface ModelField {
  type: Type;
  optional: boolean;
  name: string;
  docs: string | undefined;
}
