import { resolve } from 'node:path';

import { createTypeSync } from '../src';
import { extractErrorMessage } from '../src/util/extract-error-message';

const typesync = createTypeSync();

void typesync
  .generate({
    pathToDefinition: resolve(__dirname, 'definition.yml'),
    platform: 'ts:firebase-admin:11',
    pathToOutput: resolve(__dirname, 'models.ts'),
    indentation: 2,
    debug: true,
  })
  .then(() => {
    console.log('Successfully generated models.');
  })
  .catch(e => {
    console.error(`Unexpected error while generating models. ${extractErrorMessage(e)}`);
  });