#!/usr/bin/env node
import { render } from 'ink';
import { resolve } from 'node:path';
import React from 'react';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createTypesync, getPlatforms, getRulesPlatforms } from './api.js';
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
          describe: 'Target platform and version.',
          type: 'string',
          demandOption: true,
          choices: getPlatforms(),
        })
        .option('outFile', {
          describe: 'The path to the output file.',
          type: 'string',
          demandOption: true,
        })
        .option('indentation', {
          describe: 'Indentation or tab width for the generated code.',
          type: 'number',
          demandOption: false,
          default: 2,
        })
        .option('customPydanticBase', {
          describe: 'The base Pydantic class from which all the generated Pydantic models will extend.',
          type: 'string',
          demandOption: false,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: false,
        }),
    async args => {
      const { definition, platform, outFile, indentation, customPydanticBase, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generate({
          definition: resolve(process.cwd(), definition),
          platform,
          outFile: pathToOutputFile,
          indentation,
          customPydanticBase,
          debug,
        });

        render(
          <GenerationSuccessful
            aliasModelCount={result.aliasModelCount}
            documentModelCount={result.documentModelCount}
            pathToOutputFile={pathToOutputFile}
          />
        );
      } catch (e) {
        render(<GenerationFailed message={extractErrorMessage(e)} />);
      }
    }
  )
  .command(
    'generate-rules',
    'Generates validator functions for Firestore Security Rules and injects them into the specified file.',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('platform', {
          describe: 'Target platform and version.',
          type: 'string',
          demandOption: true,
          choices: getRulesPlatforms(),
        })
        .option('outFile', {
          describe: 'The path to the output file.',
          type: 'string',
          demandOption: true,
        })
        .option('startMarker', {
          describe: 'A marker that indicates the line after which the generated code should be inserted.',
          type: 'string',
          demandOption: false,
          default: 'typesync-start',
        })
        .option('endMarker', {
          describe: 'A marker that indicates the line before which the generated code should be inserted.',
          type: 'string',
          demandOption: false,
          default: 'typesync-end',
        })
        .option('indentation', {
          describe: 'Indentation or tab width for the generated code.',
          type: 'number',
          demandOption: false,
          default: 2,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: false,
        }),
    async args => {
      const { definition, platform, outFile, startMarker, endMarker, indentation, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateRules({
          definition: resolve(process.cwd(), definition),
          platform,
          outFile: pathToOutputFile,
          startMarker,
          endMarker,
          indentation,
          debug,
        });

        render(
          <GenerationSuccessful
            aliasModelCount={result.aliasModelCount}
            documentModelCount={result.documentModelCount}
            pathToOutputFile={pathToOutputFile}
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
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the definition file or files. Each definition file must be a YAML file containing model definitions.',
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
      const { definition, debug } = args;

      const result = await typesync.validate({
        definition: resolve(process.cwd(), definition),
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
