import type { SwiftGeneration } from '../../../generators/swift/index.js';
import { createSwiftRenderer } from '../_impl.js';

function createRenderer(indentation = 4) {
  return createSwiftRenderer({ indentation, target: 'firebase@10' });
}

describe('SwiftRendererImpl', () => {
  it('renders typealias declarations covering every type expression with model docs', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'typealias',
          modelName: 'Username',
          modelType: { type: 'string' },
          modelDocs: 'A string that uniquely identifies the user.',
        },
        { type: 'typealias', modelName: 'AnyValue', modelType: { type: 'any' }, modelDocs: null },
        { type: 'typealias', modelName: 'Active', modelType: { type: 'bool' }, modelDocs: null },
        { type: 'typealias', modelName: 'Age', modelType: { type: 'int' }, modelDocs: null },
        { type: 'typealias', modelName: 'Pi', modelType: { type: 'double' }, modelDocs: null },
        { type: 'typealias', modelName: 'CreatedAt', modelType: { type: 'date' }, modelDocs: null },
        {
          type: 'typealias',
          modelName: 'Coords',
          modelType: { type: 'tuple', elements: [{ type: 'int' }, { type: 'int' }] },
          modelDocs: null,
        },
        {
          type: 'typealias',
          modelName: 'Tags',
          modelType: { type: 'list', elementType: { type: 'string' } },
          modelDocs: null,
        },
        {
          type: 'typealias',
          modelName: 'Lookup',
          modelType: { type: 'dictionary', valueType: { type: 'int' } },
          modelDocs: null,
        },
        {
          type: 'typealias',
          modelName: 'Profile',
          modelType: { type: 'alias', name: 'Username' },
          modelDocs: null,
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/all-type-expressions.swift');
  });

  it('renders string-enum and int-enum declarations as Swift enums conforming to String/Int and Codable', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'string-enum',
          modelName: 'Color',
          modelDocs: null,
          modelType: {
            type: 'string-enum',
            cases: [
              { key: 'Red', value: 'red' },
              { key: 'Blue', value: 'blue' },
            ],
          },
        },
        {
          type: 'int-enum',
          modelName: 'Priority',
          modelDocs: 'Task priority',
          modelType: {
            type: 'int-enum',
            cases: [
              { key: 'Low', value: 1 },
              { key: 'High', value: 2 },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/enum-declarations.swift');
  });

  it('renders struct declarations with literal properties (private(set)), regular properties, optional fields, docs, and CodingKeys for non-camelCase names', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'Cat',
          modelDocs: 'A cat',
          modelType: {
            type: 'struct',
            documentIdProperty: null,
            literalProperties: [
              {
                originalName: 'type',
                name: 'type',
                docs: 'Discriminator',
                type: { type: 'string' },
                literalValue: '"cat"',
              },
            ],
            regularProperties: [
              {
                originalName: 'lives_left',
                name: 'livesLeft',
                type: { type: 'int' },
                optional: false,
                docs: 'How many lives',
              },
              {
                originalName: 'nickname',
                name: 'nickname',
                type: { type: 'string' },
                optional: true,
                docs: null,
              },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/struct-declaration.swift');
  });

  it('renders document-model structs with @DocumentID and the FirebaseFirestore import', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'User',
          modelDocs: null,
          modelType: {
            type: 'struct',
            documentIdProperty: { name: 'id' },
            literalProperties: [],
            regularProperties: [
              { originalName: 'username', name: 'username', type: { type: 'string' }, optional: false, docs: null },
              { originalName: 'created_at', name: 'createdAt', type: { type: 'date' }, optional: false, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/document-id-struct.swift');
  });

  it('renders a struct whose @DocumentID property is renamed via swift.documentIdProperty.name (so a body-side `id` field can coexist)', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'Project',
          modelDocs: null,
          modelType: {
            type: 'struct',
            documentIdProperty: { name: 'documentId' },
            literalProperties: [],
            regularProperties: [
              {
                originalName: 'id',
                name: 'id',
                type: { type: 'string' },
                optional: false,
                docs: 'Caller-supplied identifier; not the document path id.',
              },
              { originalName: 'name', name: 'name', type: { type: 'string' }, optional: false, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/document-id-rename.swift');
  });

  it('renders a struct with a renamed @DocumentID but no body-property renames, leaving CodingKeys synthesis to the Swift compiler', async () => {
    // When no body property has a remap, we must NOT emit an explicit
    // CodingKeys block: synthesized CodingKeys naturally include the
    // @DocumentID-wrapped property under its declared Swift name, and the
    // Firebase SDK still recognizes it via the property wrapper. Emitting an
    // unnecessary explicit CodingKeys would just be noise.
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'Org',
          modelDocs: null,
          modelType: {
            type: 'struct',
            documentIdProperty: { name: 'documentId' },
            literalProperties: [],
            regularProperties: [
              { originalName: 'name', name: 'name', type: { type: 'string' }, optional: false, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/document-id-rename-no-body-rename.swift');
  });

  it('renders a struct that combines a renamed regular property (swift.name) with a renamed @DocumentID property', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'Project',
          modelDocs: null,
          modelType: {
            type: 'struct',
            documentIdProperty: { name: 'documentId' },
            literalProperties: [],
            regularProperties: [
              {
                originalName: 'display_name',
                name: 'displayName',
                type: { type: 'string' },
                optional: false,
                docs: null,
              },
              { originalName: 'id', name: 'externalId', type: { type: 'string' }, optional: false, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/document-id-and-field-rename.swift');
  });

  it('renders a discriminated-union-enum declaration with cases, CodingKeys, and Codable init/encode methods', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'discriminated-union-enum',
          modelName: 'Pet',
          modelDocs: null,
          modelType: {
            type: 'discriminated-union-enum',
            discriminant: 'type',
            values: [
              { structName: 'Cat', discriminantValue: 'cat' },
              { structName: 'Dog', discriminantValue: 'dog' },
            ],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/discriminated-union-declaration.swift');
  });

  it('renders a simple-union-enum declaration with one case per variant and Codable init/encode methods', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'simple-union-enum',
          modelName: 'StringOrInt',
          modelDocs: null,
          modelType: {
            type: 'simple-union-enum',
            values: [{ type: { type: 'string' } }, { type: { type: 'int' } }],
          },
        },
      ],
    };

    const result = await createRenderer().render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/simple-union-declaration.swift');
  });

  it('respects the configured indentation', async () => {
    const generation: SwiftGeneration = {
      type: 'swift',
      declarations: [
        {
          type: 'struct',
          modelName: 'Profile',
          modelDocs: null,
          modelType: {
            type: 'struct',
            documentIdProperty: null,
            literalProperties: [],
            regularProperties: [
              { originalName: 'name', name: 'name', type: { type: 'string' }, optional: false, docs: null },
            ],
          },
        },
      ],
    };

    const result = await createRenderer(2).render(generation);
    await expect(result.content).toMatchFileSnapshot('./__file_snapshots__/indentation-2.swift');
  });
});
