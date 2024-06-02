import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

interface Context {
  adjustedSchema: schema.rules.Schema;
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
      return readonlyFieldPredicateForListType(t, prevDataParam, nextDataParam, ctx);
    case 'map':
      return readonlyFieldPredicateForMapType(t, prevDataParam, nextDataParam, ctx);
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
    innerPredicates: t.elements.map(elementType =>
      readonlyFieldPredicateForType(elementType, prevDataParam, nextDataParam, ctx)
    ),
  };
}

export function readonlyFieldPredicateForListType(
  t: schema.rules.types.List,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  // TODO: Confirm
  return readonlyFieldPredicateForType(t.elementType, prevDataParam, nextDataParam, ctx);
}

export function readonlyFieldPredicateForMapType(
  t: schema.rules.types.Map,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  // TODO: Confirm
  return readonlyFieldPredicateForType(t.valueType, prevDataParam, nextDataParam, ctx);
}

export function readonlyFieldPredicateForObjectType(
  t: schema.rules.types.Object,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  const { adjustedSchema } = ctx;
  const innerPredicates: rules.Predicate[] = [];

  const readonlyKeys = t.fields.filter(field => field.readonly).map(field => field.name);
  if (readonlyKeys.length > 0) {
    innerPredicates.push({ type: 'map-diff-has-affected-keys', prevDataParam, nextDataParam, keys: readonlyKeys });
  }

  t.fields.forEach(field => {
    if (field.type.type === 'alias') {
      const aliasModel = adjustedSchema.getAliasModel(field.type.name);
      if (aliasModel?.type.type === 'object') {
        // TODO: What about other types like union?
        innerPredicates.push({
          type: 'readonly-field-validator',
          validatorName: ctx.getReadonlyFieldValidatorNameForModel(field.type.name),
          prevDataParam: `${prevDataParam}.${field.name}`,
          nextDataParam: `${nextDataParam}.${field.name}`,
        });
      }
    } else if (field.type.type === 'object') {
      const objectPredicate = readonlyFieldPredicateForObjectType(
        field.type,
        `${prevDataParam}.${field.name}`,
        `${nextDataParam}.${field.name}`,
        ctx
      );
      innerPredicates.push(objectPredicate);
    }
    // TODO: What about other types like union?
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
  // TODO: Implement
  return { type: 'boolean', value: false };
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
  // TODO: Implement
  return { type: 'boolean', value: false };
}
