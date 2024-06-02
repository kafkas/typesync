import type { rules } from '../../../platforms/rules/index.js';
import { schema } from '../../../schema/index.js';
import { readonlyFieldPredicateForType } from '../_readonly-field-predicates.js';

describe('readonlyFieldPredicateForType()', () => {
  const prevDataParam = 'prevData';
  const nextDataParam = 'nextData';
  const getReadonlyFieldValidatorNameForModel = (modelName: string) => `isReadonlyFieldAffectedFor${modelName}`;

  it(`returns the correct 'or' predicate for a tuple type`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const tupleType: schema.rules.types.Tuple = {
      type: 'tuple',
      elements: [
        {
          type: 'object',
          fields: [{ name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: true }],
          additionalFields: false,
        },
        {
          type: 'string',
        },
      ],
    };
    const predicate = readonlyFieldPredicateForType(tupleType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'or',
      alignment: 'horizontal',
      innerPredicates: [
        {
          type: 'or',
          alignment: 'vertical',
          innerPredicates: [
            {
              type: 'map-diff-has-affected-keys',
              keys: ['role'],
              prevDataParam: 'prevData[0]',
              nextDataParam: 'nextData[0]',
            },
          ],
        },
        {
          type: 'boolean',
          value: false,
        },
      ],
    };
    expect(predicate).toEqual(expectedPredicate);
  });

  it(`returns a 'false' boolean predicate for a list type`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const listType: schema.rules.types.List = {
      type: 'list',
      elementType: {
        type: 'object',
        fields: [{ name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: true }],
        additionalFields: false,
      },
    };
    const predicate = readonlyFieldPredicateForType(listType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'boolean',
      value: false,
    };
    expect(predicate).toEqual(expectedPredicate);
  });

  it(`returns a 'false' boolean predicate for a map type`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const mapType: schema.rules.types.Map = {
      type: 'map',
      valueType: {
        type: 'object',
        fields: [{ name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: true }],
        additionalFields: false,
      },
    };
    const predicate = readonlyFieldPredicateForType(mapType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'boolean',
      value: false,
    };
    expect(predicate).toEqual(expectedPredicate);
  });

  it(`returns the correct 'or' predicate for a flat object type`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const objectType: schema.rules.types.Object = {
      type: 'object',
      fields: [
        { name: 'first_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'last_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: true },
        { name: 'created_at', type: { type: 'timestamp' }, docs: null, optional: false, readonly: true },
      ],
      additionalFields: false,
    };
    const predicate = readonlyFieldPredicateForType(objectType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'or',
      alignment: 'vertical',
      innerPredicates: [
        {
          type: 'map-diff-has-affected-keys',
          keys: ['role', 'created_at'],
          prevDataParam,
          nextDataParam,
        },
      ],
    };
    expect(predicate).toEqual(expectedPredicate);
  });

  it(`returns the correct 'or' predicate for an object type with nested fields`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const objectType: schema.rules.types.Object = {
      type: 'object',
      fields: [
        { name: 'first_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'last_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        {
          name: 'info',
          type: {
            type: 'object',
            fields: [
              { name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: true },
              { name: 'website_url', type: { type: 'string' }, docs: null, optional: true, readonly: false },
              {
                name: 'metadata',
                type: { type: 'map', valueType: { type: 'string' } },
                docs: null,
                optional: true,
                readonly: true,
              },
            ],
            additionalFields: false,
          },
          docs: null,
          optional: false,
          readonly: false,
        },
        { name: 'created_at', type: { type: 'timestamp' }, docs: null, optional: false, readonly: true },
      ],
      additionalFields: false,
    };
    const predicate = readonlyFieldPredicateForType(objectType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'or',
      alignment: 'vertical',
      innerPredicates: [
        {
          type: 'map-diff-has-affected-keys',
          keys: ['created_at'],
          prevDataParam,
          nextDataParam,
        },
        {
          type: 'or',
          alignment: 'vertical',
          innerPredicates: [
            {
              type: 'map-diff-has-affected-keys',
              keys: ['role', 'metadata'],
              prevDataParam: `${prevDataParam}.info`,
              nextDataParam: `${nextDataParam}.info`,
            },
          ],
        },
      ],
    };
    expect(predicate).toEqual(expectedPredicate);
  });

  it(`returns a 'false' boolean predicate for an object type with no readonly fields`, () => {
    const adjustedSchema = schema.rules.createSchema();
    const objectType: schema.rules.types.Object = {
      type: 'object',
      fields: [
        { name: 'first_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'last_name', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'role', type: { type: 'string' }, docs: null, optional: false, readonly: false },
        { name: 'created_at', type: { type: 'timestamp' }, docs: null, optional: false, readonly: false },
      ],
      additionalFields: false,
    };
    const predicate = readonlyFieldPredicateForType(objectType, prevDataParam, nextDataParam, {
      adjustedSchema,
      getReadonlyFieldValidatorNameForModel,
    });
    const expectedPredicate: rules.Predicate = {
      type: 'boolean',
      value: false,
    };
    expect(predicate).toEqual(expectedPredicate);
  });
});
