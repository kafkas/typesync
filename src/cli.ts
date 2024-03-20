#!/usr/bin/env node
import { resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createTypeSync } from './api';
import { isGenerationPlatform } from './core/validation';

const typesync = createTypeSync();

void yargs(hideBin(process.argv))
  .command(
    'generate',
    'Generates models from a definition file',
    y => {
      return y
        .option('pathToDefinition', {
          describe: 'Path to the definition YAML file',
          type: 'string',
          demandOption: true,
        })
        .option('pathToOutputDir', {
          describe: 'Path to output',
          type: 'string',
          demandOption: true,
        })
        .option('platform', {
          describe: 'Target platform and version (e.g., ts:firebase-admin:11)',
          type: 'string',
          demandOption: true,
        })
        .option('indentation', {
          describe: 'Indentation',
          type: 'count',
          demandOption: false,
        });
    },
    async args => {
      const { pathToDefinition, pathToOutputDir, platform } = args;

      if (!isGenerationPlatform(platform)) {
        throw new Error('Wrong platform');
      }

      await typesync.generate({
        pathToDefinition: resolve(process.cwd(), pathToDefinition),
        pathToOutputDir: resolve(process.cwd(), pathToOutputDir),
        platform,
        debug: false,
        indentation: 4,
      });
    }
  )
  .demandCommand(1)
  .help()
  .parse();
