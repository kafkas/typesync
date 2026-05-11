import type { ZodGenerationTarget, ZodVariant } from '../../../api/index.js';
import { createZodGenerator } from '../../../generators/zod/index.js';
import { schema } from '../../../schema/index.js';
import { createZodRenderer } from '../_impl.js';

async function generateAndRender(
  s: schema.Schema,
  config: {
    target?: ZodGenerationTarget;
    variant?: ZodVariant;
    indentation?: number;
    emitInferredTypes?: boolean;
    inferredTypeNamePattern?: string;
  } = {}
) {
  const target = config.target ?? 'firebase-admin@13';
  const variant = config.variant ?? 'v4';
  const indentation = config.indentation ?? 2;
  const generation = createZodGenerator({
    target,
    variant,
    schemaNamePattern: '{modelName}Schema',
    emitInferredTypes: config.emitInferredTypes ?? false,
    inferredTypeNamePattern: config.inferredTypeNamePattern ?? '{modelName}',
  }).generate(s);
  const file = await createZodRenderer({ target, variant, indentation }).render(generation);
  return file.content;
}

describe('Zod generator + renderer end-to-end', () => {
  it('produces a representative v4 file from a real schema', async () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string', docs: 'Unique user handle.' },
      Role: {
        model: 'alias',
        type: {
          type: 'enum',
          members: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
        },
      },
      Tag: { model: 'alias', type: { type: 'list', elementType: 'string' } },
      Event: {
        model: 'alias',
        type: {
          type: 'union',
          discriminant: 'kind',
          variants: [
            {
              type: 'object',
              fields: {
                kind: { type: { type: 'literal', value: 'click' } },
                x: { type: 'int' },
              },
            },
            {
              type: 'object',
              fields: {
                kind: { type: { type: 'literal', value: 'scroll' } },
                dy: { type: 'int' },
              },
            },
          ],
        },
        docs: 'A user-interaction event.',
      },
      User: {
        model: 'document',
        path: 'users/{userId}',
        docs: 'A user document.',
        type: {
          type: 'object',
          additionalFields: false,
          fields: {
            username: { type: 'Username', docs: "The user's chosen handle." },
            role: { type: 'Role' },
            tags: { type: 'Tag', optional: true },
            createdAt: { type: 'timestamp', docs: 'When the user signed up.' },
            avatar: { type: 'bytes', optional: true },
            bio: { type: { type: 'map', valueType: 'string' }, optional: true },
          },
        },
      },
    });

    const content = await generateAndRender(s);
    await expect(content).toMatchFileSnapshot('./__file_snapshots__/end-to-end-v4.ts');
  });

  it('produces a v3 file with .strict()/.passthrough() and the v3 z.record signature', async () => {
    const s = schema.createSchemaFromDefinition({
      Lookup: { model: 'alias', type: { type: 'map', valueType: 'int' } },
      Loose: {
        model: 'alias',
        type: { type: 'object', additionalFields: true, fields: { id: { type: 'string' } } },
      },
    });

    const content = await generateAndRender(s, { variant: 'v3' });
    await expect(content).toMatchFileSnapshot('./__file_snapshots__/end-to-end-v3.ts');
  });

  it('emits `export type X = z.infer<typeof XSchema>;` after each schema when emitInferredTypes is true', async () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string', docs: 'Unique handle.' },
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: { type: 'object', fields: { name: { type: 'Username' }, age: { type: 'int', optional: true } } },
      },
    });

    const content = await generateAndRender(s, { emitInferredTypes: true });
    await expect(content).toMatchFileSnapshot('./__file_snapshots__/end-to-end-inferred-types.ts');
  });
});
