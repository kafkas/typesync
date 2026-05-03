import { documentModel, objectField } from '../_zod-schemas.js';

describe('definition objectField', () => {
  it('parses a field without any platform overrides', () => {
    const parsed = objectField.parse({ type: 'string' });
    expect(parsed).toEqual({ type: 'string' });
  });

  it('accepts a `swift.name` override and preserves it on the parsed output', () => {
    const parsed = objectField.parse({
      type: 'string',
      swift: { name: 'externalId' },
    });
    expect(parsed).toEqual({ type: 'string', swift: { name: 'externalId' } });
  });

  it('rejects an empty `swift.name` string', () => {
    expect(() =>
      objectField.parse({
        type: 'string',
        swift: { name: '' },
      })
    ).toThrow();
  });

  it('rejects unknown keys inside the `swift` block', () => {
    expect(() =>
      objectField.parse({
        type: 'string',
        swift: { name: 'externalId', alias: 'oops' },
      })
    ).toThrow();
  });

  it('rejects unknown top-level keys (so `python: { name: ... }` fails until we add it)', () => {
    expect(() =>
      objectField.parse({
        type: 'string',
        python: { name: 'external_id' },
      })
    ).toThrow();
  });
});

describe('definition documentModel', () => {
  function validBody(extra: Record<string, unknown> = {}) {
    return {
      model: 'document' as const,
      path: 'projects/{projectId}',
      type: { type: 'object' as const, fields: {} },
      ...extra,
    };
  }

  it('parses a document model without any platform overrides', () => {
    const parsed = documentModel.parse(validBody());
    expect(parsed.swift).toBeUndefined();
  });

  it('accepts `swift.documentIdProperty.name` and preserves it on the parsed output', () => {
    const parsed = documentModel.parse(validBody({ swift: { documentIdProperty: { name: 'documentId' } } }));
    expect(parsed.swift?.documentIdProperty?.name).toBe('documentId');
  });

  it('rejects an empty `swift.documentIdProperty.name`', () => {
    expect(() => documentModel.parse(validBody({ swift: { documentIdProperty: { name: '' } } }))).toThrow();
  });

  it('rejects unknown keys inside `swift.documentIdProperty`', () => {
    expect(() =>
      documentModel.parse(validBody({ swift: { documentIdProperty: { name: 'documentId', oops: true } } }))
    ).toThrow();
  });

  it('rejects unknown keys inside the `swift` block on a document model', () => {
    expect(() => documentModel.parse(validBody({ swift: { unknownOption: true } }))).toThrow();
  });
});
