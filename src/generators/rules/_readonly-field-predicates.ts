import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { flatTypeToRules } from './_converters.js';
import { typeHasReadonlyField } from './_has-readonly-field.js';
import { typePredicateForType } from './_type-predicates.js';

interface Context {
  adjustedSchema: schema.rules.Schema;
  getTypeValidatorNameForModel: (modelName: string) => string;
  getReadonlyFieldValidatorNameForModel: (modelName: string) => string;
}

export function readonlyFieldPredicateForType(
  t: schema.rules.types.Type,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  switch (t.type) {
    case 'any':
    case 'unknown':
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'timestamp':
    case 'string-literal':
    case 'int-literal':
    case 'boolean-literal':
    case 'string-enum':
    case 'int-enum':
      return { type: 'boolean', value: false };
    case 'tuple':
      return readonlyFieldPredicateForTupleType(t, prevDataParam, nextDataParam, ctx);
    case 'list':
      return readonlyFieldPredicateForListType(t);
    case 'map':
      return readonlyFieldPredicateForMapType(t);
    case 'object':
      return readonlyFieldPredicateForObjectType(t, prevDataParam, nextDataParam, ctx);
    case 'discriminated-union':
      return readonlyFieldPredicateForDiscriminatedUnionType(t, prevDataParam, nextDataParam, ctx);
    case 'simple-union':
      return readonlyFieldPredicateForSimpleUnionType(t, prevDataParam, nextDataParam, ctx);
    case 'alias':
      return readonlyFieldPredicateForAliasType(t, prevDataParam, nextDataParam, ctx);
    default:
      assertNever(t);
  }
}

export function readonlyFieldPredicateForTupleType(
  t: schema.rules.types.Tuple,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  return {
    type: 'or',
    alignment: 'horizontal',
    innerPredicates: t.elements.map((elementType, elementIdx) =>
      readonlyFieldPredicateForType(
        elementType,
        `${prevDataParam}[${elementIdx}]`,
        `${nextDataParam}[${elementIdx}]`,
        ctx
      )
    ),
  };
}

export function readonlyFieldPredicateForListType(_t: schema.rules.types.List): rules.Predicate {
  return { type: 'boolean', value: false };
}

export function readonlyFieldPredicateForMapType(_t: schema.rules.types.Map): rules.Predicate {
  return { type: 'boolean', value: false };
}

export function readonlyFieldPredicateForObjectType(
  t: schema.rules.types.Object,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  const { adjustedSchema } = ctx;

  if (!typeHasReadonlyField(t, adjustedSchema)) {
    return { type: 'boolean', value: false };
  }

  const innerPredicates: rules.Predicate[] = [];

  const readonlyKeys = t.fields.filter(field => field.readonly).map(field => field.name);

  if (readonlyKeys.length > 0) {
    innerPredicates.push({ type: 'map-diff-has-affected-keys', prevDataParam, nextDataParam, keys: readonlyKeys });
  }

  t.fields.forEach(field => {
    if (typeHasReadonlyField(field.type, adjustedSchema)) {
      const predicate = readonlyFieldPredicateForType(
        field.type,
        `${prevDataParam}.${field.name}`,
        `${nextDataParam}.${field.name}`,
        ctx
      );
      innerPredicates.push(predicate);
    }
  });

  return {
    type: 'or',
    alignment: 'vertical',
    innerPredicates,
  };
}

export function readonlyFieldPredicateForDiscriminatedUnionType(
  t: schema.rules.types.DiscriminatedUnion,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  const { adjustedSchema, getTypeValidatorNameForModel } = ctx;
  const variants = adjustedSchema.resolveDiscriminatedUnionVariants(t);

  const innerPredicates = variants.map((variant): rules.Predicate => {
    if (variant.type === 'object-variant') {
      const rulesType = flatTypeToRules(variant.objectType);
      const typePredicate = typePredicateForType(rulesType, prevDataParam, {
        getTypeValidatorNameForModel,
      });
      return { type: 'and', alignment: 'horizontal', innerPredicates: [typePredicate] };
    } else if (variant.type === 'alias-variant') {
      return { type: 'and', alignment: 'horizontal', innerPredicates: [] };
    } else {
      assertNever(variant);
    }
  });

  return { type: 'or', alignment: 'vertical', innerPredicates };
}

export function readonlyFieldPredicateForSimpleUnionType(
  t: schema.rules.types.SimpleUnion,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  // TODO: Implement
  return { type: 'boolean', value: false };
}

export function readonlyFieldPredicateForAliasType(
  t: schema.rules.types.Alias,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  return {
    type: 'readonly-field-validator',
    validatorName: ctx.getReadonlyFieldValidatorNameForModel(t.name),
    prevDataParam,
    nextDataParam,
  };
}
