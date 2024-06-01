import type { rules } from '../../platforms/rules/index.js';
import type { schema } from '../../schema/index.js';

interface Context {
  getReadonlyFieldValidatorNameForModel: (modelName: string) => string;
}

export function readonlyFieldPredicateForObjectType(
  t: schema.rules.types.Object,
  s: schema.rules.Schema,
  prevDataParam: string,
  nextDataParam: string,
  ctx: Context
): rules.Predicate {
  // TODO: Make dynamic
  const innerPredicates: rules.Predicate[] = [];

  const readonlyKeys = t.fields.filter(field => field.readonly).map(field => field.name);
  if (readonlyKeys.length > 0) {
    innerPredicates.push({ type: 'map-diff-has-affected-keys', prevDataParam, nextDataParam, keys: readonlyKeys });
  }

  t.fields.forEach(field => {
    if (field.type.type === 'alias') {
      const aliasModel = s.getAliasModel(field.type.name);
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
        s,
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
