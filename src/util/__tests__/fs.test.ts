import { existsSync, mkdirSync, rmdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { assert } from '../assert.js';
import { getDirName, getFileName, validateEmptyDir } from '../fs.js';

describe('fs utils', () => {
  describe('validateEmptyDir()', () => {
    it('should throw if the input represents a file', () => {
      const filePath = resolve(getDirName(import.meta.url), getFileName(import.meta.url));

      expect(() => validateEmptyDir(filePath)).toThrow();
    });

    it('should throw if the specified directory is not empty', () => {
      const parentDir = resolve(getDirName(import.meta.url), '..');

      expect(() => validateEmptyDir(parentDir)).toThrow();
    });

    it('should create the directory if it does not exist', () => {
      const pathToDir = resolve(getDirName(import.meta.url), '__some-dir');
      assert(!existsSync(pathToDir), 'Directory should be empty for the test.');

      validateEmptyDir(pathToDir);
      const existsAfterValidation = existsSync(pathToDir);

      expect(existsAfterValidation).toBe(true);

      rmdirSync(pathToDir);
    });

    it('should not throw if the input represents an empty directory', () => {
      const pathToDir = resolve(getDirName(import.meta.url), '__empty-dir');
      mkdirSync(pathToDir);

      expect(() => validateEmptyDir(pathToDir)).not.toThrow();

      rmdirSync(pathToDir);
    });
  });
});
