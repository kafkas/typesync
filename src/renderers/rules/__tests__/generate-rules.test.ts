import { resolve } from 'node:path';

import { RulesGeneration } from '../../../generators/rules/index.js';
import { getDirName } from '../../../util/fs.js';
import { createRulesRenderer } from '../_impl.js';

describe('RulesRendererImpl', () => {
  it('correctly renders a Security Rules generation', async () => {
    const renderer = createRulesRenderer({
      platform: 'rules:2',
      indentation: 2,
      pathToOutputFile: resolve(getDirName(import.meta.url), `firestore.rules`),
      startMarker: 't-start',
      endMarker: 't-end',
      validatorNamePattern: 'is{modelName}',
      validatorParamName: 'data',
    });

    const generation: RulesGeneration = {
      type: 'rules',
      declarations: [
        {
          type: 'validator',
          modelName: 'User',
          modelType: {
            type: 'object',
            fields: [
              { type: { type: 'string' }, optional: false, name: 'username' },
              {
                type: {
                  type: 'enum',
                  members: [{ value: 'owner' }, { value: 'admin' }, { value: 'member' }],
                },
                optional: false,
                name: 'role',
              },
              {
                type: {
                  type: 'simple-union',
                  variants: [{ type: 'string' }, { type: 'list' }],
                },
                optional: false,
                name: 'path',
              },
              {
                type: {
                  type: 'list',
                },
                optional: false,
                name: 'pets',
              },
              {
                type: {
                  type: 'string',
                },
                optional: true,
                name: 'website_url',
              },
              {
                type: {
                  type: 'timestamp',
                },
                optional: false,
                name: 'created_at',
              },
            ],
            additionalFields: false,
          },
        },
      ],
    };

    const result = await renderer.render(generation);

    expect(result).toMatchSnapshot();
  });
});
