import { assertNever } from '../../util/assert.js';
import type {
  Alias,
  Any,
  Bool,
  DiscriminatedUnion,
  Enum,
  Float,
  Int,
  List,
  Literal,
  Map,
  Object,
  RulesDataType,
  SimpleUnion,
  String,
  Timestamp,
  Tuple,
  Type,
} from './_types.js';

export interface ValueEqualityPredicate {
  type: 'value-equality';
  varName: string;
  varValue: string;
}

export interface TypeEqualityPredicate {
  type: 'type-equality';
  varName: string;
  varType: RulesDataType;
}

export interface TypeValidatorPredicate {
  type: 'type-validator';
  validatorName: string;
  varName: string;
}

export interface ReadonlyFieldValidatorPredicate {
  type: 'readonly-field-validator';
  validatorName: string;
  prevDataParam: string;
  nextDataParam: string;
}

export interface MapHasKeyPredicate {
  type: 'map-has-key';
  varName: string;
  key: string;
}

export interface MapHasOnlyKeysPredicate {
  type: 'map-has-only-keys';
  varName: string;
  keys: string[];
}

export interface LiteralPredicate {
  type: 'literal';
  value: string;
}

export interface OrPredicate {
  type: 'or';
  innerPredicates: Predicate[];
}

export interface AndPredicate {
  type: 'and';
  alignment: 'vertical' | 'horizontal';
  innerPredicates: Predicate[];
}

export interface NegationPredicate {
  type: 'negation';
  originalPredicate: Predicate;
}

export type Predicate =
  | ValueEqualityPredicate
  | TypeEqualityPredicate
  | TypeValidatorPredicate
  | ReadonlyFieldValidatorPredicate
  | MapHasKeyPredicate
  | MapHasOnlyKeysPredicate
  | LiteralPredicate
  | OrPredicate
  | AndPredicate
  | NegationPredicate;

export function typePredicateForAnyType(_t: Any): Predicate {
  return { type: 'literal', value: `true` };
}

export function typePredicateForStringType(t: String, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForBoolType(t: Bool, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForFloatType(t: Float, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForIntType(t: Int, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForTimestampType(t: Timestamp, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForLiteralType(t: Literal, varName: string): Predicate {
  return { type: 'value-equality', varName, varValue: typeof t.value === 'string' ? `'${t.value}'` : `${t.value}` };
}

export function typePredicateForEnumType(t: Enum, varName: string): Predicate {
  return {
    type: 'or',
    innerPredicates: t.members.map(member => ({
      type: 'value-equality',
      varName,
      varValue: typeof member.value === 'string' ? `'${member.value}'` : `${member.value}`,
    })),
  };
}

export function typePredicateForTupleType(t: Tuple, varName: string, ctx: Context): Predicate {
  const primaryPredicate: Predicate = {
    type: 'type-equality',
    varName,
    varType: { type: 'list' },
  };
  const elementPredicates = t.elements.map((elementType, elementIdx) =>
    typePredicateForType(elementType, `${varName}[${elementIdx}]`, ctx)
  );
  return {
    type: 'and',
    alignment: 'horizontal',
    innerPredicates: [primaryPredicate, ...elementPredicates],
  };
}

export function typePredicateForListType(t: List, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForMapType(t: Map, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForObjectType(t: Object, varName: string, ctx: Context): Predicate {
  const mapTypePredicate: Predicate = {
    type: 'type-equality',
    varName,
    varType: { type: 'map' },
  };
  const hasOnlySpecifiedKeysPredicate: Predicate = {
    type: 'map-has-only-keys',
    varName,
    keys: t.fields.map(f => f.name),
  };
  const fieldPredicates: Predicate[] = t.fields.map(field => {
    const p = typePredicateForType(field.type, `${varName}.${field.name}`, ctx);
    if (field.optional) {
      const optionalPredicate: Predicate = {
        type: 'negation',
        originalPredicate: {
          type: 'map-has-key',
          varName,
          key: field.name,
        },
      };
      return { type: 'or', innerPredicates: [p, optionalPredicate] };
    } else {
      return p;
    }
  });
  return {
    type: 'and',
    alignment: 'vertical',
    innerPredicates: [
      mapTypePredicate,
      ...(t.additionalFields ? [] : [hasOnlySpecifiedKeysPredicate]),
      ...fieldPredicates,
    ],
  };
}

export function typePredicateForDiscriminatedUnionType(
  t: DiscriminatedUnion,
  varName: string,
  ctx: Context
): Predicate {
  const variantPredicates = t.variants.map(variantType => {
    switch (variantType.type) {
      case 'object':
        return typePredicateForObjectType(variantType, varName, ctx);
      case 'alias':
        return typePredicateForAliasType(variantType, varName, ctx);
      default:
        assertNever(variantType);
    }
  });
  return {
    type: 'or',
    innerPredicates: variantPredicates,
  };
}

export function typePredicateForSimpleUnionType(t: SimpleUnion, varName: string, ctx: Context): Predicate {
  const variantPredicates = t.variants.map(variantType => {
    return typePredicateForType(variantType, varName, ctx);
  });
  return {
    type: 'or',
    innerPredicates: variantPredicates,
  };
}

export function typePredicateForAliasType(t: Alias, varName: string, ctx: Context): Predicate {
  return {
    type: 'type-validator',
    varName,
    validatorName: ctx.getTypeValidatorNameForModel(t.name),
  };
}

interface Context {
  getTypeValidatorNameForModel: (modelName: string) => string;
}

export function typePredicateForType(t: Type, varName: string, ctx: Context): Predicate {
  switch (t.type) {
    case 'any':
      return typePredicateForAnyType(t);
    case 'string':
      return typePredicateForStringType(t, varName);
    case 'bool':
      return typePredicateForBoolType(t, varName);
    case 'float':
      return typePredicateForFloatType(t, varName);
    case 'int':
      return typePredicateForIntType(t, varName);
    case 'timestamp':
      return typePredicateForTimestampType(t, varName);
    case 'literal':
      return typePredicateForLiteralType(t, varName);
    case 'enum':
      return typePredicateForEnumType(t, varName);
    case 'tuple':
      return typePredicateForTupleType(t, varName, ctx);
    case 'list':
      return typePredicateForListType(t, varName);
    case 'map':
      return typePredicateForMapType(t, varName);
    case 'object':
      return typePredicateForObjectType(t, varName, ctx);
    case 'discriminated-union':
      return typePredicateForDiscriminatedUnionType(t, varName, ctx);
    case 'simple-union':
      return typePredicateForSimpleUnionType(t, varName, ctx);
    case 'alias':
      return typePredicateForAliasType(t, varName, ctx);
    default:
      assertNever(t);
  }
}
