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
  varName: string;
  varModelName: string;
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
  | MapHasKeyPredicate
  | MapHasOnlyKeysPredicate
  | LiteralPredicate
  | OrPredicate
  | AndPredicate
  | NegationPredicate;

export function predicateForAnyType(_t: Any): Predicate {
  return { type: 'literal', value: `true` };
}

export function predicateForStringType(t: String, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForBoolType(t: Bool, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForFloatType(t: Float, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForIntType(t: Int, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForTimestampType(t: Timestamp, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForLiteralType(t: Literal, varName: string): Predicate {
  return { type: 'value-equality', varName, varValue: typeof t.value === 'string' ? `'${t.value}'` : `${t.value}` };
}

export function predicateForEnumType(t: Enum, varName: string): Predicate {
  return {
    type: 'or',
    innerPredicates: t.members.map(member => ({
      type: 'value-equality',
      varName,
      varValue: typeof member.value === 'string' ? `'${member.value}'` : `${member.value}`,
    })),
  };
}

export function predicateForTupleType(t: Tuple, varName: string): Predicate {
  const primaryPredicate: Predicate = {
    type: 'type-equality',
    varName,
    varType: { type: 'list' },
  };
  const elementPredicates = t.elements.map((elementType, elementIdx) =>
    predicateForType(elementType, `${varName}[${elementIdx}]`)
  );
  return {
    type: 'and',
    alignment: 'horizontal',
    innerPredicates: [primaryPredicate, ...elementPredicates],
  };
}

export function predicateForListType(t: List, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForMapType(t: Map, varName: string): Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function predicateForObjectType(t: Object, varName: string): Predicate {
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
    const p = predicateForType(field.type, `${varName}.${field.name}`);
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

export function predicateForDiscriminatedUnionType(t: DiscriminatedUnion, varName: string): Predicate {
  const variantPredicates = t.variants.map(variantType => {
    switch (variantType.type) {
      case 'object':
        return predicateForObjectType(variantType, varName);
      case 'alias':
        return predicateForAliasType(variantType, varName);
      default:
        assertNever(variantType);
    }
  });
  return {
    type: 'or',
    innerPredicates: variantPredicates,
  };
}

export function predicateForSimpleUnionType(t: SimpleUnion, varName: string): Predicate {
  const variantPredicates = t.variants.map(variantType => {
    return predicateForType(variantType, varName);
  });
  return {
    type: 'or',
    innerPredicates: variantPredicates,
  };
}

export function predicateForAliasType(t: Alias, varName: string): Predicate {
  return {
    type: 'type-validator',
    varName,
    varModelName: t.name,
  };
}

export function predicateForType(t: Type, varName: string): Predicate {
  switch (t.type) {
    case 'any':
      return predicateForAnyType(t);
    case 'string':
      return predicateForStringType(t, varName);
    case 'bool':
      return predicateForBoolType(t, varName);
    case 'float':
      return predicateForFloatType(t, varName);
    case 'int':
      return predicateForIntType(t, varName);
    case 'timestamp':
      return predicateForTimestampType(t, varName);
    case 'literal':
      return predicateForLiteralType(t, varName);
    case 'enum':
      return predicateForEnumType(t, varName);
    case 'tuple':
      return predicateForTupleType(t, varName);
    case 'list':
      return predicateForListType(t, varName);
    case 'map':
      return predicateForMapType(t, varName);
    case 'object':
      return predicateForObjectType(t, varName);
    case 'discriminated-union':
      return predicateForDiscriminatedUnionType(t, varName);
    case 'simple-union':
      return predicateForSimpleUnionType(t, varName);
    case 'alias':
      return predicateForAliasType(t, varName);
    default:
      assertNever(t);
  }
}
