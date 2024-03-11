import { multiply } from './multiply-str';

describe('multiply-str', () => {
  describe('returns empty string if count is 0', () => {
    function testWith(str: string) {
      it(`for "${str}"`, () => {
        expect(multiply(str, 0)).toBe('');
      });
    }

    testWith('');
    testWith('a');
    testWith('ab');
    testWith('abcdefg');
  });

  describe('returns itself if count is 1', () => {
    function testWith(str: string) {
      it(`for "${str}"`, () => {
        expect(multiply(str, 1)).toBe(str);
      });
    }

    testWith('');
    testWith('a');
    testWith('ab');
    testWith('abcdefg');
  });

  describe('returns expected value if count > 1', () => {
    function testWith(str: string, count: number, expectedVal: string) {
      it(`for str="${str}" and count=${count}`, () => {
        expect(multiply(str, count)).toBe(expectedVal);
      });
    }

    testWith('', 2, '');
    testWith('a', 2, 'aa');
    testWith('ab', 2, 'abab');
    testWith('abc', 3, 'abcabcabc');

    it('should fail', () => {
      expect(false).toBe(true);
    });
  });
});
