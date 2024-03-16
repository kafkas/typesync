import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../../util/assert';

export interface Expression {
  content: string;
}

interface TSType {
  type: string;
  expression: Expression;
}

export class NullType implements TSType {
  public readonly type = 'null';

  public readonly expression: Expression = {
    content: 'null',
  };
}

export class StringType implements TSType {
  public readonly type = 'string';

  public readonly expression: Expression = {
    content: 'string',
  };
}

export class BooleanType implements TSType {
  public readonly type = 'boolean';

  public readonly expression: Expression = {
    content: 'boolean',
  };
}

export class NumberType implements TSType {
  public readonly type = 'number';

  public readonly expression: Expression = {
    content: 'number',
  };
}

export class TimestampType implements TSType {
  public readonly type = 'timestamp';

  public readonly expression: Expression = {
    content: 'firestore.Timestamp',
  };
}

export type PrimitiveType = NullType | StringType | BooleanType | NumberType | TimestampType;

export class LiteralType implements TSType {
  public readonly type = 'literal';

  public get expression(): Expression {
    switch (typeof this.value) {
      case 'string':
        return { content: `'${this.value}'` };
      case 'number':
        return { content: `${this.value}` };
      case 'boolean':
        return { content: `${this.value}` };
      default:
        assertNever(this.value);
    }
  }

  public constructor(public readonly value: string | number | boolean) {}
}

export class EnumType implements TSType {
  public readonly type = 'enum';

  public get expression(): Expression {
    const { items } = this;
    const content = items
      .map(({ value }) => {
        switch (typeof value) {
          case 'string':
            return `'${value}'`;
          case 'number':
            return `${value}`;
          default:
            assertNever(value);
        }
      })
      .join(' | ');
    return { content };
  }

  public constructor(
    public readonly items: {
      label: string;
      value: string | number;
    }[]
  ) {}
}

export class TupleType implements TSType {
  public readonly type = 'tuple';

  public get expression(): Expression {
    const commaSeparatedExpressions = this.values.map(vt => vt.expression.content).join(', ');
    return { content: `[${commaSeparatedExpressions}]` };
  }

  public constructor(public readonly values: Type[]) {}
}

export class ListType implements TSType {
  public readonly type = 'list';

  public get expression(): Expression {
    const expression = this.of.expression;
    return { content: `${expression.content}[]` };
  }

  public constructor(public readonly of: Type) {}
}

export class ObjectType implements TSType {
  public readonly type = 'object';

  public get expression(): Expression {
    const { fields } = this;
    const builder = new StringBuilder();

    builder.append(`{\n`);
    fields.forEach(field => {
      if (field.docs !== undefined) {
        // TODO: Add docs
      }
      const { expression } = field.type;
      builder.append(`${field.name}${field.optional ? '?' : ''}: ${expression.content};\n`);
    });
    builder.append(`}`);
    return { content: builder.toString() };
  }

  public constructor(public readonly fields: FieldType[]) {}
}

export class FieldType {
  public constructor(
    public readonly type: Type,
    public readonly optional: boolean,
    public readonly name: string,
    public readonly docs: string | undefined
  ) {}
}

export class UnionType implements TSType {
  public readonly type = 'union';

  public get expression(): Expression {
    const separatedExpressions = this.members.map(vt => vt.expression.content).join(' | ');
    return { content: `${separatedExpressions}` };
  }

  public constructor(public readonly members: Type[]) {}

  public addMember(member: Type) {
    this.members.push(member);
  }
}

export class AliasType implements TSType {
  public readonly type = 'alias';

  public get expression(): Expression {
    return { content: this.name };
  }

  public constructor(public readonly name: string) {}
}

export type Type = PrimitiveType | LiteralType | EnumType | TupleType | ListType | ObjectType | UnionType | AliasType;

export interface ModelField {
  type: Type;
  optional: boolean;
  name: string;
  docs: string | undefined;
}
