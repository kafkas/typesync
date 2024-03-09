import { StringBuilder } from '@proficient/ds';

import { assertNever } from '../../util/assert';
import { multiply } from '../../util/multiply-str';
import { space } from '../../util/space';

function indent(indentation: number, count: number) {
  return multiply(space(indentation), count);
}

export class NoneType {
  public readonly type = 'none';

  public toString() {
    return 'None';
  }
}

export class UndefinedType {
  public readonly type = 'undefined';

  public toString() {
    return 'TypeSyncUndefined';
  }
}

export class StringType {
  public readonly type = 'string';

  public toString() {
    return 'str';
  }
}

export class BooleanType {
  public readonly type = 'bool';

  public toString() {
    return 'bool';
  }
}

export class IntType {
  public readonly type = 'int';

  public toString() {
    return 'int';
  }
}

export class DatetimeType {
  public readonly type = 'datetime';

  public toString() {
    return 'datetime.datetime';
  }
}

export type PrimitiveValueType = NoneType | UndefinedType | StringType | BooleanType | IntType | DatetimeType;

export class LiteralValueType {
  public readonly type = 'literal';

  public toString() {
    switch (typeof this.value) {
      case 'string':
        return `typing.Literal["${this.value}"]`;
      case 'number':
        // TODO: Don't allow float literals in the spec
        return `typing.Literal[${this.value}]`;
      case 'boolean':
        return `typing.Literal[${this.value ? 'True' : 'False'}]`;
      default:
        assertNever(this.value);
    }
  }

  public constructor(public readonly value: string | number | boolean) {}
}

interface EnumItem {
  label: string;
  value: string | number;
}

export class EnumValueType {
  public readonly type = 'enum';

  public toString(indentation: number) {
    const builder = new StringBuilder();
    builder.append(`class ${this.name}(enum.Enum):\n`);
    this.items.forEach(item => {
      builder.append(
        `${indent(indentation, 1)}${item.label} = ${typeof item.value === 'string' ? `"${item.value}"` : item.value}\n`
      );
    });
    builder.append(`\n`);
    return builder.toString();
  }

  public constructor(
    public readonly name: string,
    private readonly items: EnumItem[]
  ) {}
}

export class TupleValueType {
  public readonly type = 'tuple';

  public toString(indentation: number) {
    // TODO: Implement
    // const pyTypes = this.values.map(v => this.getPyTypeForValueType(v, depth)).join(', ');
    // return `tuple[${pyTypes}]`;

    return 'typing.Any';
  }

  public constructor(private readonly values: ValueType[]) {}
}

export class ListValueType {
  public readonly type = 'list';

  public toString(indentation: number) {
    // TODO: Implement
    // const pyType = this.getPyTypeForValueType(type.of, depth);
    // return `typing.List[${pyType}]`;

    return 'typing.Any';
  }

  public constructor(private readonly of: ValueType) {}
}

export class MapValueType {
  public readonly type = 'map';

  public toString(indentation: number) {
    // TODO: Implement

    return 'typing.Any';
  }

  public constructor(private readonly fields: ModelField[]) {}
}

export class UnionValueType {
  public readonly type = 'union';

  public toString(indentation: number) {
    // TODO: Implement

    // const pyTypes: string[] = type.members.map(memberValueType => {
    //   return this.getPyTypeForValueType(memberValueType, depth);
    // });
    // return `typing.Union[${pyTypes.join(', ')}]`;

    return 'typing.Any';
  }

  public constructor(private readonly members: ValueType[]) {}
}

export class AliasValueType {
  public readonly type = 'alias';

  public toString() {
    return this.name;
  }

  public constructor(public readonly name: string) {}
}

export type ValueType =
  | PrimitiveValueType
  | LiteralValueType
  | EnumValueType
  | TupleValueType
  | ListValueType
  | MapValueType
  | UnionValueType
  | AliasValueType;

export interface ModelField {
  type: ValueType;
  optional: boolean;
  name: string;
  docs: string | undefined;
}
