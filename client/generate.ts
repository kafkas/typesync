import { resolve } from 'node:path';
import { createTypeSync } from '../src';
import { extractErrorMessage } from '../src/util/extract-error-message';

const typesync = createTypeSync({ debug: true });

void typesync
  .generate({
    pathToDefinition: resolve(__dirname, 'definition.yml'),
    platform: 'ts',
    pathToOutput: resolve(__dirname, 'output.ts'),
  })
  .then(() => {
    console.log('Successfully generated models.');
  })
  .catch(e => {
    console.error(`Unexpected error while generating models. ${extractErrorMessage(e)}`);
  });
