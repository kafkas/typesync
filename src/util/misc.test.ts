import { extractGenericId } from './misc.js';

describe('extractGenericId()', () => {
  it(`throws if the argument is not generic`, () => {
    expect(() => extractGenericId('projectId')).toThrow(Error);
  });

  it(`correctly extracts generic ID content`, () => {
    expect(extractGenericId('{projectId}')).toBe('projectId');
  });
});
