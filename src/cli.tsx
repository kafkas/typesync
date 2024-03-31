#!/usr/bin/env node
import { render } from 'ink';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';

import { createTypeSync, getPlatforms } from './api.js';
import { CheckFailed } from './components/CheckFailed.js';
import { CheckSuccessful } from './components/CheckSuccessful.js';
import { GenerationFailed } from './components/GenerationFailed.js';
import { GenerationSuccessful } from './components/GenerationSuccessful.js';
import { extractErrorMessage } from './util/extract-error-message.js';
import { getDirName } from './util/fs.js';

function extractVersionFromPackageJson() {
  const packageJsonSchema = z.object({
    version: z.string(),
  });
  const dirName = getDirName(import.meta.url);
  const pathToPackageJson = resolve(dirName, '../package.json');
  const packageJsonRaw = JSON.parse(readFileSync(pathToPackageJson).toString());
  const { version } = packageJsonSchema.parse(packageJsonRaw);
  return version;
}

const typesync = createTypeSync();

const cliVersion = extractVersionFromPackageJson();

await yargs(hideBin(process.argv))
  .command(
    'generate',
    'Generates models from a definition file',
    y =>
      y
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
        }),
    async args => {
      const { pathToDefinition, platform, pathToOutputDir, indentation, debug } = args;

      try {
        const result = await typesync.generate({
          pathToDefinition: resolve(process.cwd(), pathToDefinition),
          platform,
          pathToOutputDir: resolve(process.cwd(), pathToOutputDir),
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
    'check',
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

      const result = await typesync.check({
        pathToDefinition: resolve(process.cwd(), pathToDefinition),
        debug,
      });

      if (result.success) {
        render(<CheckSuccessful />);
      } else {
        render(<CheckFailed message={result.message} />);
      }
    }
  )
  .demandCommand(1)
  .help()
  .version(cliVersion)
  .parse();
