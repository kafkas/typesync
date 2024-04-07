import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

import { getDirName } from './fs.js';

export function extractPackageJsonVersion() {
  const packageJsonSchema = z.object({
    version: z.string(),
  });
  const dirName = getDirName(import.meta.url);
  const pathToPackageJson = resolve(dirName, '../../package.json');
  const packageJsonRaw = JSON.parse(readFileSync(pathToPackageJson).toString());
  const { version } = packageJsonSchema.parse(packageJsonRaw);
  return version;
}
