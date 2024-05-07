import { extractErrorMessage } from '../../util/extract-error-message.js';
import { parseType } from '../types-new/parse.js';

describe('schema type validator', () => {
  describe('string-enum', () => {
    it('throws if there are 0 members', () => {
      const parse = () =>
        parseType({
          type: 'string-enum',
          members: [],
        });

      try {
        parse();
      } catch (e) {
        console.log('here ya go laddie', extractErrorMessage(e));
      }

      expect(parse).toThrow(Error);
    });
  });

  it('throws if', () => {
    const parse = () =>
      parseType({
        type: 'string-enum',
        members: [
          { label: 'bla2', value: 'bla' },
          { label: 'bla2', value: 'bla2' },
        ],
      });

    try {
      parse();
    } catch (e) {
      console.log('here ya go laddie', extractErrorMessage(e));
    }

    expect(parse).toThrow(Error);
  });
});
