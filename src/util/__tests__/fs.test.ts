import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { resolve } from 'path';

import { assert } from '../assert';
import { validateEmptyDir } from '../fs';

describe('fs utils', () => {
  describe('validateEmptyDir()', () => {
    it('should throw if the input represents a file', () => {
      const filePath = resolve(__dirname, __filename);

      expect(() => validateEmptyDir(filePath)).toThrow();
    });

    it('should throw if the specified directory is not empty', () => {
      const parentDir = resolve(__dirname, '..');

      expect(() => validateEmptyDir(parentDir)).toThrow();
    });

    it('should create the directory if it does not exist', () => {
      const pathToDir = resolve(__dirname, '__some-dir');
      assert(!existsSync(pathToDir), 'Directory should be empty for the test.');

      validateEmptyDir(pathToDir);
      const existsAfterValidation = existsSync(pathToDir);

      expect(existsAfterValidation).toBe(true);

      rmdirSync(pathToDir);
    });

    it('should not throw if the input represents an empty directory', () => {
      const pathToDir = resolve(__dirname, '__empty-dir');
      mkdirSync(pathToDir);

      expect(() => validateEmptyDir(pathToDir)).not.toThrow();

      rmdirSync(pathToDir);
    });
  });
});
