import { resolve } from 'node:path';

import { createTypeSync } from '../src';
import { extractErrorMessage } from '../src/util/extract-error-message';

const typesync = createTypeSync();

void typesync
  .generate({
    pathToDefinition: resolve(__dirname, 'definition.yml'),
    platform: 'py:firebase-admin:6',
    pathToOutput: resolve(__dirname, 'models.py'),
    indentation: 4,
    debug: true,
  })
  .then(() => {
    console.log('Successfully generated models.');
  })
  .catch(e => {
    console.error(`Unexpected error while generating models. ${extractErrorMessage(e)}`);
  });
