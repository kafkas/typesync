import type { types } from '../types/index.js';
import { validateType } from '../types/parse.js';

describe('schema type validator', () => {
  describe('string-enum', () => {
    it('throws if there are 0 members', () => {
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`throws if there are duplicate member values`, async () => {
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value1' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`throws if there are duplicate member labels`, async () => {
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label1', value: 'value2' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`does not throw if there are multiple members with distinct values`, async () => {
      const t: types.StringEnum = {
        type: 'string-enum',
        members: [
          { label: 'label1', value: 'value1' },
          { label: 'label2', value: 'value2' },
          { label: 'label3', value: 'value3' },
        ],
      };
      expect(() => validateType(t)).not.toThrow();
    });
  });

  describe('int-enum', () => {
    it('throws if there are 0 members', () => {
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`throws if there are duplicate member values`, async () => {
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 1 },
          { label: 'label3', value: 2 },
        ],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`throws if there are duplicate member labels`, async () => {
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label1', value: 2 },
          { label: 'label3', value: 3 },
        ],
      };
      expect(() => validateType(t)).toThrow(Error);
    });

    it(`does not throw if there are multiple members with distinct values`, async () => {
      const t: types.IntEnum = {
        type: 'int-enum',
        members: [
          { label: 'label1', value: 1 },
          { label: 'label2', value: 2 },
          { label: 'label3', value: 3 },
        ],
      };
      expect(() => validateType(t)).not.toThrow();
    });
  });
});
