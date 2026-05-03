import { schema } from '../../../schema/index.js';
import { createRulesGenerator } from '../_impl.js';

function createGenerator() {
  return createRulesGenerator({
    typeValidatorNamePattern: 'isValid{modelName}',
    typeValidatorParamName: 'data',
    readonlyFieldValidatorNamePattern: 'isReadonlyFieldAffectedFor{modelName}',
    readonlyFieldValidatorPrevDataParamName: 'prevData',
    readonlyFieldValidatorNextDataParamName: 'nextData',
  });
}

describe('RulesGeneratorImpl', () => {
  it('produces an empty generation for an empty schema', () => {
    const generation = createGenerator().generate(schema.createSchema());
    expect(generation).toEqual({
      type: 'rules',
      typeValidatorDeclarations: [],
      readonlyFieldValidatorDeclarations: [],
    });
  });

  it('emits a type-validator with type-equality predicates for each primitive alias model', () => {
    const s = schema.createSchemaFromDefinition({
      AStr: { model: 'alias', type: 'string' },
      ABool: { model: 'alias', type: 'boolean' },
      AInt: { model: 'alias', type: 'int' },
      ADouble: { model: 'alias', type: 'double' },
      ATs: { model: 'alias', type: 'timestamp' },
    });

    const generation = createGenerator().generate(s);

    const expectedRulesTypeByModelName: Record<string, { type: string }> = {
      AStr: { type: 'string' },
      ABool: { type: 'bool' },
      AInt: { type: 'int' },
      ADouble: { type: 'number' },
      ATs: { type: 'timestamp' },
    };

    expect(generation.typeValidatorDeclarations).toHaveLength(Object.keys(expectedRulesTypeByModelName).length);
    generation.typeValidatorDeclarations.forEach(decl => {
      expect(decl.type).toBe('type-validator');
      expect(decl.paramName).toBe('data');
      const modelName = decl.validatorName.replace(/^isValid/, '');
      expect(decl.predicate).toEqual({
        type: 'type-equality',
        varName: 'data',
        varType: expectedRulesTypeByModelName[modelName],
      });
    });
  });

  it(`emits a 'literal' true predicate for an 'any' alias and a passthrough type predicate for unknown/nil`, () => {
    const s = schema.createSchemaFromDefinition({
      AAny: { model: 'alias', type: 'any' },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations[0]?.predicate).toEqual({ type: 'literal', value: 'true' });
  });

  it('emits a value-equality predicate for literal alias models', () => {
    const s = schema.createSchemaFromDefinition({
      LiteralStr: { model: 'alias', type: { type: 'literal', value: 'cat' } },
      LiteralInt: { model: 'alias', type: { type: 'literal', value: 7 } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidLiteralStr')?.predicate).toEqual({
      type: 'value-equality',
      varName: 'data',
      varValue: `'cat'`,
    });
    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidLiteralInt')?.predicate).toEqual({
      type: 'value-equality',
      varName: 'data',
      varValue: `7`,
    });
  });

  it('emits a horizontal `or` of value-equality predicates for enum alias models', () => {
    const s = schema.createSchemaFromDefinition({
      Color: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
          ],
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations[0]?.predicate).toEqual({
      type: 'or',
      alignment: 'horizontal',
      innerPredicates: [
        { type: 'value-equality', varName: 'data', varValue: `'red'` },
        { type: 'value-equality', varName: 'data', varValue: `'green'` },
      ],
    });
  });

  it('emits a list type-equality predicate for list and map alias models', () => {
    const s = schema.createSchemaFromDefinition({
      Tags: { model: 'alias', type: { type: 'list', elementType: 'string' } },
      Lookup: { model: 'alias', type: { type: 'map', valueType: 'int' } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidTags')?.predicate).toEqual({
      type: 'type-equality',
      varName: 'data',
      varType: { type: 'list' },
    });
    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidLookup')?.predicate).toEqual({
      type: 'type-equality',
      varName: 'data',
      varType: { type: 'map' },
    });
  });

  it('emits an `and` of type-equality and per-element predicates for tuple alias models', () => {
    const s = schema.createSchemaFromDefinition({
      Coords: { model: 'alias', type: { type: 'tuple', elements: ['int', 'string'] } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations[0]?.predicate).toEqual({
      type: 'and',
      alignment: 'horizontal',
      innerPredicates: [
        { type: 'type-equality', varName: 'data', varType: { type: 'list' } },
        { type: 'type-equality', varName: 'data[0]', varType: { type: 'int' } },
        { type: 'type-equality', varName: 'data[1]', varType: { type: 'string' } },
      ],
    });
  });

  it('emits an `and` of map predicate, has-only-keys predicate, and per-field predicates for object models', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            id: { type: 'string' },
            age: { type: 'int' },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations[0]?.predicate).toEqual({
      type: 'and',
      alignment: 'vertical',
      innerPredicates: [
        { type: 'type-equality', varName: 'data', varType: { type: 'map' } },
        { type: 'map-has-only-keys', varName: 'data', keys: ['id', 'age'] },
        { type: 'type-equality', varName: 'data.id', varType: { type: 'string' } },
        { type: 'type-equality', varName: 'data.age', varType: { type: 'int' } },
      ],
    });
  });

  it('omits the has-only-keys predicate when an object allows additional fields', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'alias',
        type: {
          type: 'object',
          additionalFields: true,
          fields: { id: { type: 'string' } },
        },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations[0]?.predicate).toMatchObject({
      type: 'and',
      innerPredicates: [
        { type: 'type-equality', varName: 'data', varType: { type: 'map' } },
        { type: 'type-equality', varName: 'data.id', varType: { type: 'string' } },
      ],
    });
  });

  it('wraps an optional field predicate in an `or` with a `negation` of map-has-key', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'alias',
        type: {
          type: 'object',
          fields: {
            id: { type: 'string' },
            bio: { type: 'string', optional: true },
          },
        },
      },
    });

    const generation = createGenerator().generate(s);
    const predicate = generation.typeValidatorDeclarations[0]?.predicate;

    expect(predicate).toMatchObject({
      type: 'and',
      innerPredicates: expect.arrayContaining([
        {
          type: 'or',
          alignment: 'horizontal',
          innerPredicates: [
            { type: 'type-equality', varName: 'data.bio', varType: { type: 'string' } },
            { type: 'negation', originalPredicate: { type: 'map-has-key', varName: 'data', key: 'bio' } },
          ],
        },
      ]),
    });
  });

  it('emits a horizontal `or` of variant predicates for discriminated and simple unions', () => {
    const s = schema.createSchemaFromDefinition({
      DU: {
        model: 'alias',
        type: {
          type: 'union',
          discriminant: 'type',
          variants: [
            {
              type: 'object',
              fields: {
                type: { type: { type: 'literal', value: 'a' } },
                value: { type: 'string' },
              },
            },
            {
              type: 'object',
              fields: {
                type: { type: { type: 'literal', value: 'b' } },
                value: { type: 'int' },
              },
            },
          ],
        },
      },
      SU: { model: 'alias', type: { type: 'union', variants: ['string', 'int'] } },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidDU')?.predicate).toMatchObject({
      type: 'or',
      alignment: 'horizontal',
    });
    expect(generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidSU')?.predicate).toEqual({
      type: 'or',
      alignment: 'horizontal',
      innerPredicates: [
        { type: 'type-equality', varName: 'data', varType: { type: 'string' } },
        { type: 'type-equality', varName: 'data', varType: { type: 'int' } },
      ],
    });
  });

  it('references another type-validator for alias references', () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      Profile: {
        model: 'alias',
        type: { type: 'object', fields: { name: { type: 'Username' } } },
      },
    });

    const generation = createGenerator().generate(s);
    const profileDecl = generation.typeValidatorDeclarations.find(d => d.validatorName === 'isValidProfile');

    expect(profileDecl?.predicate).toMatchObject({
      type: 'and',
      innerPredicates: expect.arrayContaining([
        { type: 'type-validator', varName: 'data.name', validatorName: 'isValidUsername' },
      ]),
    });
  });

  it('emits a type-validator for each document model', () => {
    const s = schema.createSchemaFromDefinition({
      Profile: {
        model: 'document',
        path: 'profiles/{profileId}',
        type: { type: 'object', fields: { name: { type: 'string' } } },
      },
    });

    const generation = createGenerator().generate(s);

    expect(generation.typeValidatorDeclarations).toHaveLength(1);
    expect(generation.typeValidatorDeclarations[0]?.validatorName).toBe('isValidProfile');
  });

  it('honors the configured validator name pattern and param name', () => {
    const generator = createRulesGenerator({
      typeValidatorNamePattern: 'check{modelName}Type',
      typeValidatorParamName: 'value',
      readonlyFieldValidatorNamePattern: 'isReadonlyFieldAffectedFor{modelName}',
      readonlyFieldValidatorPrevDataParamName: 'prevData',
      readonlyFieldValidatorNextDataParamName: 'nextData',
    });
    const s = schema.createSchemaFromDefinition({
      Tag: { model: 'alias', type: 'string' },
    });

    const generation = generator.generate(s);

    expect(generation.typeValidatorDeclarations[0]).toMatchObject({
      validatorName: 'checkTagType',
      paramName: 'value',
      predicate: { type: 'type-equality', varName: 'value', varType: { type: 'string' } },
    });
  });
});
