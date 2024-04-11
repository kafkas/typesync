import { ordinalSuffixOf } from '../ordinal-suffix.js';

describe('ordinal-suffix', () => {
  it('returns correct value for 0-13', () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => ordinalSuffixOf(i));
    const expectedValues = [
      '0th',
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
      '10th',
      '11th',
      '12th',
      '13th',
      '14th',
    ];
    expect(values).toEqual(expectedValues);
  });

  it('returns correct value for 20-24', () => {
    const values = [20, 21, 22, 23, 24].map(i => ordinalSuffixOf(i));
    const expectedValues = ['20th', '21st', '22nd', '23rd', '24th'];
    expect(values).toEqual(expectedValues);
  });
});
