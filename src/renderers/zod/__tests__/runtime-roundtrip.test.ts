import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

import { createZodGenerator } from '../../../generators/zod/index.js';
import { schema } from '../../../schema/index.js';
import { createZodRenderer } from '../_impl.js';

/**
 * Loads the rendered Zod source as actual JavaScript and returns the named
 * schema export. We strip the import statements (we already have `z` and
 * `firestore` in scope) and evaluate the rest in a Function so that the
 * generated module has access to whatever bindings we provide. This catches
 * regressions where the rendered source is well-formed text but doesn't
 * actually compose into a valid Zod schema at runtime.
 */
function loadGeneratedSchema(source: string, schemaName: string): z.ZodTypeAny {
  const stripped = source
    .split('\n')
    .filter(line => !line.startsWith('import '))
    .join('\n')
    .replace(/^export const /gm, 'const ');

  const factory = new Function('z', 'firestore', 'Buffer', `${stripped}\nreturn ${schemaName};`) as (
    zArg: unknown,
    firestoreArg: unknown,
    BufferArg: unknown
  ) => z.ZodTypeAny;

  return factory(z, { Timestamp }, Buffer);
}

describe('runtime round-trip of generated Zod source', () => {
  it('the v4 source parses valid documents and rejects invalid ones', async () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string' },
      User: {
        model: 'document',
        path: 'users/{userId}',
        type: {
          type: 'object',
          fields: {
            username: { type: 'Username' },
            createdAt: { type: 'timestamp' },
            age: { type: 'int', optional: true },
          },
        },
      },
    });

    const generation = createZodGenerator({
      target: 'firebase-admin@13',
      variant: 'v4',
      schemaNamePattern: '{modelName}Schema',
    }).generate(s);
    const file = await createZodRenderer({
      target: 'firebase-admin@13',
      variant: 'v4',
      indentation: 2,
    }).render(generation);

    const UserSchema = loadGeneratedSchema(file.content, 'UserSchema');
    const ts = new Timestamp(1_700_000_000, 0);

    expect(UserSchema.safeParse({ username: 'alice', createdAt: ts }).success).toBe(true);
    expect(UserSchema.safeParse({ username: 'alice', createdAt: ts, age: 30 }).success).toBe(true);
    expect(UserSchema.safeParse({ username: 'alice', createdAt: ts, extra: 'oops' }).success).toBe(false);
    expect(UserSchema.safeParse({ username: 1, createdAt: ts }).success).toBe(false);
    expect(UserSchema.safeParse({ username: 'alice' }).success).toBe(false);
  });

  it('the v4 source preserves model docs in the schema description metadata', async () => {
    const s = schema.createSchemaFromDefinition({
      Username: { model: 'alias', type: 'string', docs: 'Unique handle.' },
    });
    const generation = createZodGenerator({
      target: 'firebase-admin@13',
      variant: 'v4',
      schemaNamePattern: '{modelName}Schema',
    }).generate(s);
    const file = await createZodRenderer({
      target: 'firebase-admin@13',
      variant: 'v4',
      indentation: 2,
    }).render(generation);

    const UsernameSchema = loadGeneratedSchema(file.content, 'UsernameSchema');
    expect(UsernameSchema.description).toBe('Unique handle.');
  });
});
