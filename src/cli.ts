#!/usr/bin/env node
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createTypeSync, getPlatforms } from './api';

const typesync = createTypeSync();

void yargs(hideBin(process.argv))
  .command(
    'generate',
    'Generates models from a definition file',
    y => {
      return y
        .option('pathToDefinition', {
          describe: 'Path to the definition file. Must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('platform', {
          describe: 'Target platform and version',
          type: 'string',
          demandOption: true,
          choices: getPlatforms(),
        })
        .option('pathToOutputDir', {
          describe: 'Path to the output directory',
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
        });
    },
    async args => {
      const { pathToDefinition, platform, pathToOutputDir, indentation, debug } = args;

      await typesync.generate({
        pathToDefinition: resolve(process.cwd(), pathToDefinition),
        platform,
        pathToOutputDir: resolve(process.cwd(), pathToOutputDir),
        indentation,
        debug,
      });
    }
  )
  .demandCommand(1)
  .help()
  .parse();
