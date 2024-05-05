#!/usr/bin/env node
import { render } from 'ink';
import { resolve } from 'node:path';
import React from 'react';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getPythonTargets, getSwiftTargets, getTSTargets, typesync } from './api/index.js';
import { GenerationFailed } from './components/GenerationFailed.js';
import { GenerationSuccessful } from './components/GenerationSuccessful.js';
import { ValidationFailed } from './components/ValidationFailed.js';
import { ValidationSuccessful } from './components/ValidationSuccessful.js';
import {
  DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
  DEFAULT_PY_DEBUG,
  DEFAULT_PY_INDENTATION,
  DEFAULT_RULES_DEBUG,
  DEFAULT_RULES_END_MARKER,
  DEFAULT_RULES_INDENTATION,
  DEFAULT_RULES_START_MARKER,
  DEFAULT_RULES_VALIDATOR_NAME_PATTERN,
  DEFAULT_RULES_VALIDATOR_PARAM_NAME,
  DEFAULT_SWIFT_DEBUG,
  DEFAULT_SWIFT_INDENTATION,
  DEFAULT_TS_DEBUG,
  DEFAULT_TS_INDENTATION,
} from './constants.js';
import { extractErrorMessage } from './util/extract-error-message.js';
import { extractPackageJsonVersion } from './util/extract-package-json-version.js';

const cliVersion = extractPackageJsonVersion();

await yargs(hideBin(process.argv))
  .command(
    'generate-ts',
    'Generates TypeScript type definitions for the specified schema and writes them to the specified file.',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the schema definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('target', {
          describe:
            'The target environment for which the types are generated. This option specifies the target SDK and version, ensuring that the output is compatible with the chosen environment.',
          type: 'string',
          demandOption: true,
          choices: getTSTargets(),
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
          default: DEFAULT_TS_INDENTATION,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: DEFAULT_TS_DEBUG,
        }),
    async args => {
      const { definition, target, outFile, indentation, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateTs({
          definition: resolve(process.cwd(), definition),
          target,
          outFile: pathToOutputFile,
          indentation,
          debug,
        });

        render(<GenerationSuccessful result={result} pathToOutputFile={pathToOutputFile} />);
      } catch (e) {
        const message = extractErrorMessage(e);
        render(<GenerationFailed message={message} />);
        yargs().exit(1, new Error(message));
      }
    }
  )
  .command(
    'generate-swift',
    'Generates Swift type definitions for the specified schema and writes them to the specified file.',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the schema definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('target', {
          describe:
            'The target environment for which the types are generated. This option specifies the target SDK and version, ensuring that the output is compatible with the chosen environment.',
          type: 'string',
          demandOption: true,
          choices: getSwiftTargets(),
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
          default: DEFAULT_SWIFT_INDENTATION,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: DEFAULT_SWIFT_DEBUG,
        }),
    async args => {
      const { definition, target, outFile, indentation, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateSwift({
          definition: resolve(process.cwd(), definition),
          target,
          outFile: pathToOutputFile,
          indentation,
          debug,
        });

        render(<GenerationSuccessful result={result} pathToOutputFile={pathToOutputFile} />);
      } catch (e) {
        const message = extractErrorMessage(e);
        render(<GenerationFailed message={message} />);
        yargs().exit(1, new Error(message));
      }
    }
  )
  .command(
    'generate-py',
    'Generates Python/Pydantic type definitions for the specified schema and writes them to the specified file.',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the schema definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
        })
        .option('target', {
          describe:
            'The target environment for which the types are generated. This option specifies the target SDK and version, ensuring that the output is compatible with the chosen environment.',
          type: 'string',
          demandOption: true,
          choices: getPythonTargets(),
        })
        .option('outFile', {
          describe: 'The path to the output file.',
          type: 'string',
          demandOption: true,
        })
        .option('customPydanticBase', {
          describe:
            'The base class from which all the generated Python models will extend. The base class must extend `pydantic.BaseModel` and the option must be provided in the format `x.y.ModelName`. If this option is not provided, the generated models will extend from `pydantic.BaseModel`.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
        })
        .option('indentation', {
          describe: 'Indentation or tab width for the generated code.',
          type: 'number',
          demandOption: false,
          default: DEFAULT_PY_INDENTATION,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: DEFAULT_PY_DEBUG,
        }),
    async args => {
      const { definition, target, outFile, indentation, customPydanticBase, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generatePy({
          definition: resolve(process.cwd(), definition),
          target,
          outFile: pathToOutputFile,
          indentation,
          customPydanticBase,
          debug,
        });

        render(<GenerationSuccessful result={result} pathToOutputFile={pathToOutputFile} />);
      } catch (e) {
        const message = extractErrorMessage(e);
        render(<GenerationFailed message={message} />);
        yargs().exit(1, new Error(message));
      }
    }
  )
  .command(
    'generate-rules',
    'Generates type validator functions for Firestore Security Rules and injects them into the specified file.',
    y =>
      y
        .option('definition', {
          describe:
            'The exact path or a Glob pattern to the schema definition file or files. Each definition file must be a YAML file containing model definitions.',
          type: 'string',
          demandOption: true,
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
          default: DEFAULT_RULES_START_MARKER,
        })
        .option('endMarker', {
          describe: 'A marker that indicates the line before which the generated code should be inserted.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_END_MARKER,
        })
        .option('validatorNamePattern', {
          describe: `The pattern that specifies how the validators are named. The string must contain the '{modelName}' substring (this is a literal value). For example, providing 'isValid{modelName}' ensures that the generated validators are given names like 'isValidUser', 'isValidProject' etc.`,
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_VALIDATOR_NAME_PATTERN,
        })
        .option('validatorParamName', {
          describe: 'The name of the parameter taken by each type validator.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_VALIDATOR_PARAM_NAME,
        })
        .option('indentation', {
          describe: 'Indentation or tab width for the generated code.',
          type: 'number',
          demandOption: false,
          default: DEFAULT_RULES_INDENTATION,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: DEFAULT_RULES_DEBUG,
        }),
    async args => {
      const {
        definition,
        outFile,
        startMarker,
        endMarker,
        validatorNamePattern,
        validatorParamName,
        indentation,
        debug,
      } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateRules({
          definition: resolve(process.cwd(), definition),
          outFile: pathToOutputFile,
          startMarker,
          endMarker,
          validatorNamePattern,
          validatorParamName,
          indentation,
          debug,
        });

        render(<GenerationSuccessful result={result} pathToOutputFile={pathToOutputFile} />);
      } catch (e) {
        const message = extractErrorMessage(e);
        render(<GenerationFailed message={message} />);
        yargs().exit(1, new Error(message));
      }
    }
  )
  .command(
    'validate',
    'Checks if the specified schema definition is syntactically valid.',
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
        yargs().exit(1, new Error(result.message));
      }
    }
  )
  .demandCommand(1)
  .help()
  .version(cliVersion)
  .parse();
