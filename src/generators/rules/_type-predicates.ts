import type { rules } from '../../platforms/rules/index.js';
import { assertNever } from '../../util/assert.js';

export function typePredicateForAnyType(_t: rules.Any): rules.Predicate {
  return { type: 'literal', value: `true` };
}

export function typePredicateForStringType(t: rules.String, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForBoolType(t: rules.Bool, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForFloatType(t: rules.Float, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForIntType(t: rules.Int, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForNumberType(t: rules.Number, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForTimestampType(t: rules.Timestamp, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForLiteralType(t: rules.Literal, varName: string): rules.Predicate {
  return { type: 'value-equality', varName, varValue: typeof t.value === 'string' ? `'${t.value}'` : `${t.value}` };
}

export function typePredicateForEnumType(t: rules.Enum, varName: string): rules.Predicate {
  return {
    type: 'or',
    alignment: 'horizontal',
    innerPredicates: t.members.map(member => ({
      type: 'value-equality',
      varName,
      varValue: typeof member.value === 'string' ? `'${member.value}'` : `${member.value}`,
    })),
  };
}

export function typePredicateForTupleType(t: rules.Tuple, varName: string, ctx: Context): rules.Predicate {
  const primaryPredicate: rules.Predicate = {
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

export function typePredicateForListType(t: rules.List, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForMapType(t: rules.Map, varName: string): rules.Predicate {
  return { type: 'type-equality', varName, varType: t };
}

export function typePredicateForObjectType(t: rules.Object, varName: string, ctx: Context): rules.Predicate {
  const mapTypePredicate: rules.Predicate = {
    type: 'type-equality',
    varName,
    varType: { type: 'map' },
  };
  const hasOnlySpecifiedKeysPredicate: rules.Predicate = {
    type: 'map-has-only-keys',
    varName,
    keys: t.fields.map(f => f.name),
  };
  const fieldPredicates: rules.Predicate[] = t.fields.map(field => {
    const p = typePredicateForType(field.type, `${varName}.${field.name}`, ctx);
    if (field.optional) {
      const optionalPredicate: rules.Predicate = {
        type: 'negation',
        originalPredicate: {
          type: 'map-has-key',
          varName,
          key: field.name,
        },
      };
      return { type: 'or', alignment: 'horizontal', innerPredicates: [p, optionalPredicate] };
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
  t: rules.DiscriminatedUnion,
  varName: string,
  ctx: Context
): rules.Predicate {
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
    alignment: 'horizontal',
    innerPredicates: variantPredicates,
  };
}

export function typePredicateForSimpleUnionType(t: rules.SimpleUnion, varName: string, ctx: Context): rules.Predicate {
  const variantPredicates = t.variants.map(variantType => {
    return typePredicateForType(variantType, varName, ctx);
  });
  return {
    type: 'or',
    alignment: 'horizontal',
    innerPredicates: variantPredicates,
  };
}

export function typePredicateForAliasType(t: rules.Alias, varName: string, ctx: Context): rules.Predicate {
  return {
    type: 'type-validator',
    varName,
    validatorName: ctx.getTypeValidatorNameForModel(t.name),
  };
}

interface Context {
  getTypeValidatorNameForModel: (modelName: string) => string;
}

export function typePredicateForType(t: rules.Type, varName: string, ctx: Context): rules.Predicate {
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
    case 'number':
      return typePredicateForNumberType(t, varName);
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
