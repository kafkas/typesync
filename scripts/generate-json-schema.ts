import { resolve } from 'node:path';
import { format } from 'prettier';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { definition } from '../src/definition-new/index.js';
import { assert } from '../src/util/assert.js';
import { extractPackageJsonVersion } from '../src/util/extract-package-json-version.js';
import { getDirName, writeFile } from '../src/util/fs.js';

function inferCurrentSchemaVersion() {
  const fullVersion = extractPackageJsonVersion();
  const [major, minor] = fullVersion.split('.');
  assert(major !== undefined && minor !== undefined, 'Expected package.json major and minor versions to be defined.');
  return `v${major}.${minor}`;
}

function generateJsonSchema(minorVersionName: string) {
  return zodToJsonSchema(definition.zodSchema, minorVersionName);
}

type JsonSchema = ReturnType<typeof generateJsonSchema>;

async function writeJsonSchemaToFile(jsonSchema: JsonSchema, outPath: string) {
  const jsonSchemaAsString = JSON.stringify(jsonSchema);
  const fileContent = await format(jsonSchemaAsString, {
    parser: 'json',
    tabWidth: 2,
  });
  await writeFile(outPath, fileContent);
}

async function main() {
  const minorVersionName = inferCurrentSchemaVersion();
  const jsonSchema = generateJsonSchema(minorVersionName);
  const pathToOutputFile = resolve(getDirName(import.meta.url), `../public/${minorVersionName}.json`);
  await writeJsonSchemaToFile(jsonSchema, pathToOutputFile);
}

await main();
