import { resolve } from 'node:path';
import { format } from 'prettier';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { definition } from '../src/definition/index.js';
import { assert } from '../src/util/assert.js';
import { extractPackageJsonVersion } from '../src/util/extract-package-json-version.js';
import { getDirName, writeFile } from '../src/util/fs.js';

function getSchemaVersion() {
  const fullVersion = extractPackageJsonVersion();
  const [major, minor] = fullVersion.split('.');
  assert(major !== undefined && minor !== undefined, 'Expected package.json major and minor versions to be defined.');
  return `v${major}.${minor}`;
}

async function generateJsonSchema() {
  const minorVersionName = getSchemaVersion();
  const jsonSchemaForDefinition = zodToJsonSchema(definition.schemas.definition, minorVersionName);
  const fileContent = JSON.stringify(jsonSchemaForDefinition);
  const formattedContent = await format(fileContent, {
    parser: 'json',
    tabWidth: 2,
  });
  const outPath = resolve(getDirName(import.meta.url), `../public/${minorVersionName}.json`);
  await writeFile(outPath, formattedContent);
}

await generateJsonSchema();
