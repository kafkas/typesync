#!/usr/bin/env node
import { render } from 'ink';
import { resolve } from 'node:path';
import React from 'react';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createTypesync, getPlatforms } from './api.js';
import { GenerationFailed } from './components/GenerationFailed.js';
import { GenerationSuccessful } from './components/GenerationSuccessful.js';
import { ValidationFailed } from './components/ValidationFailed.js';
import { ValidationSuccessful } from './components/ValidationSuccessful.js';
import { extractErrorMessage } from './util/extract-error-message.js';
import { extractPackageJsonVersion } from './util/extract-package-json-version.js';

const typesync = createTypesync();

const cliVersion = extractPackageJsonVersion();

await yargs(hideBin(process.argv))
  .command(
    'generate',
    'Generates models from a definition file',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('platform', {
          describe: 'Target platform and version',
          type: 'string',
          demandOption: true,
          choices: getPlatforms(),
        })
        .option('outputDir', {
          describe: 'The path to the output directory',
          type: 'string',
          demandOption: true,
        })
        .option('indentation', {
          describe: 'Indentation or tab width for the generated code',
          type: 'number',
          demandOption: false,
          default: 4,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: false,
        }),
    async args => {
      const { definition, platform, outputDir, indentation, debug } = args;

      try {
        const result = await typesync.generate({
          definition: resolve(process.cwd(), definition),
          platform,
          outputDir: resolve(process.cwd(), outputDir),
          indentation,
          debug,
        });

        render(
          <GenerationSuccessful
            aliasModelCount={result.aliasModelCount}
            documentModelCount={result.documentModelCount}
            pathToRootFile={result.pathToRootFile}
          />
        );
      } catch (e) {
        render(<GenerationFailed message={extractErrorMessage(e)} />);
      }
    }
  )
  .command(
    'validate',
    'Validates definition syntax',
    y =>
      y
        .option('pathToDefinition', {
          describe: 'Path to the definition file. Must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: false,
        }),
    async args => {
      const { pathToDefinition, debug } = args;

      const result = await typesync.validate({
        definition: resolve(process.cwd(), pathToDefinition),
        debug,
      });

      if (result.success) {
        render(<ValidationSuccessful />);
      } else {
        render(<ValidationFailed message={result.message} />);
      }
    }
  )
  .demandCommand(1)
  .help()
  .version(cliVersion)
  .parse();
