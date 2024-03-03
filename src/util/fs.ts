import { existsSync, mkdirSync } from 'node:fs';
import { writeFile as _writeFile } from 'node:fs/promises';
import { dirname } from 'path';

export async function writeFile(
  path: string,
  data: Parameters<typeof _writeFile>[1],
  opts?: Parameters<typeof _writeFile>[2]
) {
  ensureDirectoryExists(path);
  await _writeFile(path, data, opts);
}

function ensureDirectoryExists(path: string) {
  const dirName = dirname(path);
  if (existsSync(dirName)) {
    return;
  }
  ensureDirectoryExists(dirName);
  mkdirSync(dirName);
}
