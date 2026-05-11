import type { ZodGenerationTarget, ZodVariant } from '../../../api/index.js';
import type { ZodGeneration } from '../../../generators/zod/index.js';
import { createZodRenderer } from '../_impl.js';

function createRenderer(overrides: { indentation?: number; target?: ZodGenerationTarget; variant?: ZodVariant } = {}) {
  return createZodRenderer({
    indentation: overrides.indentation ?? 2,
    target: overrides.target ?? 'firebase-admin@13',
    variant: overrides.variant ?? 'v4',
  });
}

describe('ZodRendererImpl', () => {
  it('renders a v4 schema file with Firestore SDK + zod imports, model docs, and field-level describe()', async () => {
    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: true,
      usesBytes: false,
      declarations: [
        {
          type: 'schema',
          modelName: 'Username',
          schemaName: 'UsernameSchema',
          inferredTypeName: null,
          modelDocs: 'A unique handle.',
          modelKind: 'alias',
          expression: `z.string().describe("A unique handle.")`,
        },
        {
          type: 'schema',
          modelName: 'User',
          schemaName: 'UserSchema',
          inferredTypeName: null,
          modelDocs: 'A user document.',
          modelKind: 'document',
          expression: `z.strictObject({ name: z.lazy(() => UsernameSchema).describe("The user name"), createdAt: z.instanceof(firestore.Timestamp) }).describe("A user document.")`,
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/v4-with-docs.ts');
  });

  it('emits an inferred TS type after each schema export when inferredTypeName is set', async () => {
    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: false,
      usesBytes: false,
      declarations: [
        {
          type: 'schema',
          modelName: 'Username',
          schemaName: 'UsernameSchema',
          inferredTypeName: 'Username',
          modelDocs: 'A unique handle.',
          modelKind: 'alias',
          expression: `z.string().describe("A unique handle.")`,
        },
        {
          type: 'schema',
          modelName: 'User',
          schemaName: 'UserSchema',
          inferredTypeName: 'User',
          modelDocs: null,
          modelKind: 'document',
          expression: `z.strictObject({ name: z.lazy(() => UsernameSchema) })`,
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/with-inferred-types.ts');
  });

  it('omits the Firestore SDK import when no model uses timestamp or bytes', async () => {
    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: false,
      usesBytes: false,
      declarations: [
        {
          type: 'schema',
          modelName: 'Username',
          schemaName: 'UsernameSchema',
          inferredTypeName: null,
          modelDocs: null,
          modelKind: 'alias',
          expression: 'z.string()',
        },
      ],
    };

    const result = await createRenderer().render(generation);
    expect(result.content).not.toContain('firestore');
    expect(result.content).toContain(`import { z } from 'zod';`);
  });

  it('skips the Firestore SDK import for the admin target when only bytes are used (Buffer is a Node global)', async () => {
    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: false,
      usesBytes: true,
      declarations: [
        {
          type: 'schema',
          modelName: 'Avatar',
          schemaName: 'AvatarSchema',
          inferredTypeName: null,
          modelDocs: null,
          modelKind: 'alias',
          expression: 'z.instanceof(Buffer)',
        },
      ],
    };

    const result = await createRenderer({ target: 'firebase-admin@13' }).render(generation);
    expect(result.content).not.toContain(`firebase-admin/firestore`);
  });

  it('emits the right Firestore SDK import for each target family', async () => {
    const targetsByExpectedImport: Record<string, ZodGenerationTarget[]> = {
      [`import * as firestore from 'firebase-admin/firestore';`]: ['firebase-admin@13', 'firebase-admin@12'],
      [`import { firestore } from 'firebase-admin';`]: ['firebase-admin@11', 'firebase-admin@10'],
      [`import * as firestore from 'firebase/firestore';`]: ['firebase@11', 'firebase@10', 'firebase@9'],
      [`import * as firestore from '@react-native-firebase/firestore';`]: [
        'react-native-firebase@21',
        'react-native-firebase@20',
        'react-native-firebase@19',
      ],
    };

    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: true,
      usesBytes: false,
      declarations: [
        {
          type: 'schema',
          modelName: 'Stamp',
          schemaName: 'StampSchema',
          inferredTypeName: null,
          modelDocs: null,
          modelKind: 'alias',
          expression: 'z.instanceof(firestore.Timestamp)',
        },
      ],
    };

    for (const [expectedImport, targets] of Object.entries(targetsByExpectedImport)) {
      for (const target of targets) {
        const result = await createRenderer({ target }).render(generation);
        expect(result.content.split('\n')[0]).toBe(expectedImport);
      }
    }
  });

  it('respects the configured indentation', async () => {
    const generation: ZodGeneration = {
      type: 'zod',
      usesTimestamp: false,
      usesBytes: false,
      declarations: [
        {
          type: 'schema',
          modelName: 'Profile',
          schemaName: 'ProfileSchema',
          inferredTypeName: null,
          modelDocs: null,
          modelKind: 'alias',
          // Long expression to force prettier to wrap it across multiple lines.
          expression: `z.strictObject({ id: z.string().describe("The profile ID"), bio: z.string().optional().describe("A short bio about the user"), avatarUrl: z.string().optional() })`,
        },
      ],
    };

    const result = await createRenderer({ indentation: 4 }).render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/indentation-4.ts');
  });
});
