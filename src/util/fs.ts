import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { writeFile as _writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractErrorMessage } from './extract-error-message.js';

/**
 * Use it like so in any file:
 * ```ts
 * const curFileName = getFileName(import.meta.url)
 * ```
 */
export function getFileName(importMetaUrl: string) {
  return fileURLToPath(importMetaUrl);
}

/**
 * Use it like so in any file:
 * ```ts
 * const curDirName = getDirName(import.meta.url)
 * ```
 */
export function getDirName(importMetaUrl: string) {
  return dirname(getFileName(importMetaUrl));
}

/**
 * Checks if the specified directory is empty. Creates the directory if it can be created.
 * Otherwise throws.
 */
export function validateEmptyDir(pathToDir: string) {
  try {
    const stats = statSync(pathToDir);

    if (!stats.isDirectory()) {
      throw new Error(`The path ${pathToDir} is non-empty.`);
    }

    const isEmpty = readdirSync(pathToDir).length === 0;

    if (!isEmpty) {
      throw new Error(`The directory ${pathToDir} is non-empty.`);
    }
  } catch {
    try {
      mkdirSync(pathToDir, { recursive: true });

      const isEmpty = readdirSync(pathToDir).length === 0;

      if (!isEmpty) {
        throw new Error(`The directory ${pathToDir} is non-empty.`);
      }
    } catch (e) {
      throw new Error(`Unexpected error in mkdirSync(): ${extractErrorMessage(e)}`);
    }
  }
}

export async function writeFile(
  path: string,
  data: Parameters<typeof _writeFile>[1],
  opts?: Parameters<typeof _writeFile>[2]
) {
  ensureFileDirectoryExists(path);
  await _writeFile(path, data, opts);
}

function ensureFileDirectoryExists(pathToFile: string) {
  const dirName = dirname(pathToFile);
  if (existsSync(dirName)) {
    return;
  }
  ensureFileDirectoryExists(dirName);
  mkdirSync(dirName);
}
