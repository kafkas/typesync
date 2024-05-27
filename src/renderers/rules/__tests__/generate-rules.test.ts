import { resolve } from 'node:path';

import { RulesGeneration } from '../../../generators/rules/index.js';
import { getDirName } from '../../../util/fs.js';
import { createRulesRenderer } from '../_impl.js';

describe('RulesRendererImpl', () => {
  it('correctly renders a Security Rules generation', async () => {
    const renderer = createRulesRenderer({
      indentation: 2,
      pathToOutputFile: resolve(getDirName(import.meta.url), `firestore.rules`),
      startMarker: 't-start',
      endMarker: 't-end',
    });

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
              {
                type: 'type-equality',
                varName: 'data',
                varType: { type: 'map' },
              },
              {
                type: 'map-has-only-keys',
                varName: 'data',
                keys: ['username', 'role', 'path', 'pets', 'website_url', 'created_at'],
              },
              {
                type: 'type-equality',
                varName: 'data.username',
                varType: { type: 'string' },
              },
              {
                type: 'or',
                innerPredicates: [
                  { type: 'value-equality', varName: 'data.role', varValue: `'owner'` },
                  { type: 'value-equality', varName: 'data.role', varValue: `'admin'` },
                  { type: 'value-equality', varName: 'data.role', varValue: `'member'` },
                ],
              },
              {
                type: 'or',
                innerPredicates: [
                  { type: 'type-equality', varName: 'data.path', varType: { type: 'string' } },
                  { type: 'type-equality', varName: 'data.path', varType: { type: 'list' } },
                ],
              },
              {
                type: 'type-equality',
                varName: 'data.pets',
                varType: { type: 'list' },
              },
              {
                type: 'or',
                innerPredicates: [
                  { type: 'type-equality', varName: 'data.website_url', varType: { type: 'string' } },
                  {
                    type: 'negation',
                    originalPredicate: {
                      type: 'map-has-key',
                      varName: 'data',
                      key: 'website_url',
                    },
                  },
                ],
              },
              {
                type: 'type-equality',
                varName: 'data.created_at',
                varType: { type: 'timestamp' },
              },
            ],
          },
        },
      ],
      readonlyFieldValidatorDeclarations: [],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
