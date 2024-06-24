import { resolve } from 'node:path';
import { format } from 'prettier';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { definition } from '../src/definition/index.js';
import { assert, assertNever } from '../src/util/assert.js';
import { extractPackageJsonVersion } from '../src/util/extract-package-json-version.js';
import { getDirName, writeFile } from '../src/util/fs.js';

function inferCurrentSchemaVersion() {
  const fullVersion = extractPackageJsonVersion();
  const [major, minor] = fullVersion.split('.');
  assert(major !== undefined && minor !== undefined, 'Expected package.json major and minor versions to be defined.');
  return `v${major}.${minor}`;
}

function generateJsonSchema(name: string) {
  return zodToJsonSchema(definition.zodSchema, name);
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
  const [, , type] = process.argv;
  assert(
    type === 'current-version' || type === 'local',
    `The 'type' argument for generate-json-schema must be one of 'current-version' or 'local'.`
  );

  let schemaName: string | undefined;
  let pathToOutputFile: string | undefined;

  if (type === 'current-version') {
    const minorVersionName = inferCurrentSchemaVersion();
    schemaName = minorVersionName;
    pathToOutputFile = resolve(getDirName(import.meta.url), `../public/${minorVersionName}.json`);
  } else if (type === 'local') {
    schemaName = 'local';
    pathToOutputFile = resolve(getDirName(import.meta.url), `../schema.local.json`);
  } else {
    assertNever(type);
  }

  const jsonSchema = generateJsonSchema(schemaName);
  await writeJsonSchemaToFile(jsonSchema, pathToOutputFile);
}

await main();
