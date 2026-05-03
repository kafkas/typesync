import { resolve } from 'node:path';

import type { RulesGeneration } from '../../../generators/rules/index.js';
import { getDirName } from '../../../util/fs.js';
import { createRulesRenderer } from '../_impl.js';

const fixturePath = (filename: string) => resolve(getDirName(import.meta.url), '__fixtures__', filename);

function createRenderer(overrides: { pathToOutputFile?: string; indentation?: number } = {}) {
  return createRulesRenderer({
    indentation: overrides.indentation ?? 2,
    pathToOutputFile: overrides.pathToOutputFile ?? fixturePath('with-markers.rules'),
    startMarker: 't-start',
    endMarker: 't-end',
  });
}

describe('RulesRendererImpl', () => {
  it('renders a type-validator declaration covering every predicate kind between the start and end markers', async () => {
    const generation: RulesGeneration = {
      type: 'rules',
      typeValidatorDeclarations: [
        {
          type: 'type-validator',
          validatorName: 'isUser',
          paramName: 'data',
          predicate: {
            type: 'and',
            alignment: 'vertical',
            innerPredicates: [
              { type: 'type-equality', varName: 'data', varType: { type: 'map' } },
              {
                type: 'map-has-only-keys',
                varName: 'data',
                keys: ['username', 'role', 'website_url', 'created_at'],
              },
              { type: 'type-equality', varName: 'data.username', varType: { type: 'string' } },
              {
                type: 'or',
                alignment: 'horizontal',
                innerPredicates: [
                  { type: 'value-equality', varName: 'data.role', varValue: `'owner'` },
                  { type: 'value-equality', varName: 'data.role', varValue: `'admin'` },
                ],
              },
              {
                type: 'or',
                alignment: 'horizontal',
                innerPredicates: [
                  { type: 'type-equality', varName: 'data.website_url', varType: { type: 'string' } },
                  {
                    type: 'negation',
                    originalPredicate: { type: 'map-has-key', varName: 'data', key: 'website_url' },
                  },
                ],
              },
              { type: 'type-validator', varName: 'data.created_at', validatorName: 'isTimestamp' },
              { type: 'reference', varName: 'data.misc' },
              { type: 'literal', value: 'true' },
              { type: 'boolean', value: true },
            ],
          },
        },
      ],
      readonlyFieldValidatorDeclarations: [],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/type-validator-with-all-predicates.rules');
  });

  it('renders a readonly-field-validator declaration with prev/next data params and the affected-keys predicate', async () => {
    const generation: RulesGeneration = {
      type: 'rules',
      typeValidatorDeclarations: [],
      readonlyFieldValidatorDeclarations: [
        {
          type: 'readonly-field-validator',
          validatorName: 'isReadonlyAffectedForUser',
          prevDataParamName: 'prevData',
          nextDataParamName: 'nextData',
          predicate: {
            type: 'or',
            alignment: 'vertical',
            innerPredicates: [
              {
                type: 'map-diff-has-affected-keys',
                prevDataParam: 'prevData',
                nextDataParam: 'nextData',
                keys: ['role', 'created_at'],
              },
              {
                type: 'readonly-field-validator',
                validatorName: 'isReadonlyAffectedForUserAddress',
                prevDataParam: 'prevData.address',
                nextDataParam: 'nextData.address',
              },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/readonly-field-validator.rules');
  });

  it('preserves the surrounding output file content and replaces only the section between the markers', async () => {
    const generation: RulesGeneration = {
      type: 'rules',
      typeValidatorDeclarations: [
        {
          type: 'type-validator',
          validatorName: 'isUsername',
          paramName: 'data',
          predicate: { type: 'type-equality', varName: 'data', varType: { type: 'string' } },
        },
      ],
      readonlyFieldValidatorDeclarations: [],
    };

    const result = await createRenderer().render(generation);

    expect(result.content).toContain(`rules_version = '2';`);
    expect(result.content).toContain(`function isSignedIn() {`);
    expect(result.content).toContain(`function isUsername(data) {`);
    expect(result.content).toContain(`return (data is string);`);
  });

  it('uses the configured indentation when rendering function bodies', async () => {
    const generation: RulesGeneration = {
      type: 'rules',
      typeValidatorDeclarations: [
        {
          type: 'type-validator',
          validatorName: 'isUsername',
          paramName: 'data',
          predicate: { type: 'type-equality', varName: 'data', varType: { type: 'string' } },
        },
      ],
      readonlyFieldValidatorDeclarations: [],
    };

    const result = await createRenderer({ indentation: 4 }).render(generation);

    expect(result.content).toContain(`    function isUsername(data) {`);
    expect(result.content).toContain(`        return (data is string);`);
  });

  it('throws when the configured output file does not exist', async () => {
    const renderer = createRenderer({ pathToOutputFile: fixturePath('does-not-exist.rules') });
    await expect(
      renderer.render({ type: 'rules', typeValidatorDeclarations: [], readonlyFieldValidatorDeclarations: [] })
    ).rejects.toThrow(/does not exist/);
  });

  it('throws when the start marker is missing from the output file', async () => {
    const renderer = createRenderer({ pathToOutputFile: fixturePath('missing-start-marker.rules') });
    await expect(
      renderer.render({ type: 'rules', typeValidatorDeclarations: [], readonlyFieldValidatorDeclarations: [] })
    ).rejects.toThrow(/start marker.*missing/);
  });

  it('throws when the end marker is missing from the output file', async () => {
    const renderer = createRenderer({ pathToOutputFile: fixturePath('missing-end-marker.rules') });
    await expect(
      renderer.render({ type: 'rules', typeValidatorDeclarations: [], readonlyFieldValidatorDeclarations: [] })
    ).rejects.toThrow(/end marker.*missing/);
  });

  it('throws when the start marker appears after the end marker in the output file', async () => {
    const renderer = createRenderer({ pathToOutputFile: fixturePath('misplaced-markers.rules') });
    await expect(
      renderer.render({ type: 'rules', typeValidatorDeclarations: [], readonlyFieldValidatorDeclarations: [] })
    ).rejects.toThrow(/must be placed before/);
  });
});
