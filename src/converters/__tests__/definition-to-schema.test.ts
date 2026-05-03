import { fieldToSchema } from '../definition-to-schema.js';

describe('fieldToSchema', () => {
  it('omits the platformOptions key when no per-platform overrides are set', () => {
    const result = fieldToSchema('name', { type: 'string' });
    expect(result).not.toHaveProperty('platformOptions');
  });

  it('threads `swift.name` from the definition layer onto schema.platformOptions.swift', () => {
    const result = fieldToSchema('id', {
      type: 'string',
      swift: { name: 'externalId' },
    });
    expect(result.platformOptions).toEqual({ swift: { name: 'externalId' } });
  });

  it('does not mutate the input swift options object', () => {
    const swift = { name: 'externalId' };
    const result = fieldToSchema('id', { type: 'string', swift });
    expect(result.platformOptions?.swift).not.toBe(swift);
  });
});
