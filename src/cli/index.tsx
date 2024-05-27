#!/usr/bin/env node
import { render } from 'ink';
import { resolve } from 'node:path';
import React from 'react';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getPythonTargets, getSchemaGraphOrientations, getSwiftTargets, getTSTargets, typesync } from '../api/index.js';
import { getObjectTypeFormats } from '../api/ts.js';
import {
  DEFAULT_GRAPH_DEBUG,
  DEFAULT_GRAPH_END_MARKER,
  DEFAULT_GRAPH_ORIENTATION,
  DEFAULT_GRAPH_START_MARKER,
  DEFAULT_PY_CUSTOM_PYDANTIC_BASE,
  DEFAULT_PY_DEBUG,
  DEFAULT_PY_INDENTATION,
  DEFAULT_PY_UNDEFINED_SENTINEL_NAME,
  DEFAULT_RULES_DEBUG,
  DEFAULT_RULES_END_MARKER,
  DEFAULT_RULES_INDENTATION,
  DEFAULT_RULES_START_MARKER,
  DEFAULT_RULES_TYPE_VALIDATOR_NAME_PATTERN,
  DEFAULT_RULES_VALIDATOR_PARAM_NAME,
  DEFAULT_SWIFT_DEBUG,
  DEFAULT_SWIFT_INDENTATION,
  DEFAULT_TS_DEBUG,
  DEFAULT_TS_INDENTATION,
  DEFAULT_TS_OBJECT_TYPE_FORMAT,
  DEFAULT_VALIDATE_DEBUG,
  RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM,
} from '../constants.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { extractPackageJsonVersion } from '../util/extract-package-json-version.js';
import { GenerationFailed } from './components/GenerationFailed.js';
import { GenerationSuccessful } from './components/GenerationSuccessful.js';
import { ValidationFailed } from './components/ValidationFailed.js';
import { ValidationSuccessful } from './components/ValidationSuccessful.js';

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
        .option('objectTypeFormat', {
          describe:
            'Controls how objects are defined in the TypeScript output. Object types can be represented either by interfaces or type aliases.',
          type: 'string',
          demandOption: false,
          choices: getObjectTypeFormats(),
          default: DEFAULT_TS_OBJECT_TYPE_FORMAT,
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
      const { definition, target, outFile, objectTypeFormat, indentation, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateTs({
          definition: resolve(process.cwd(), definition),
          target,
          outFile: pathToOutputFile,
          objectTypeFormat,
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
        .option('undefinedSentinelName', {
          describe:
            'The name of the sentinel value used to indicate that a field should be missing from a given object. This is generated as a variable alongside your model definitions.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_PY_UNDEFINED_SENTINEL_NAME,
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
      const { definition, target, outFile, indentation, customPydanticBase, undefinedSentinelName, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generatePy({
          definition: resolve(process.cwd(), definition),
          target,
          outFile: pathToOutputFile,
          indentation,
          customPydanticBase,
          undefinedSentinelName,
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
          describe:
            'A marker that indicates the line after which the generated code should be inserted. Make sure to use a string that is unique within the file.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_START_MARKER,
        })
        .option('endMarker', {
          describe:
            'A marker that indicates the line before which the generated code should be inserted. Make sure to use a string that is unique within the file.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_END_MARKER,
        })
        .option('typeValidatorNamePattern', {
          describe: `The pattern that specifies how the validators are named. The string must contain the '${RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM}' substring (this is a literal value). For example, providing 'isValid${RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM}' ensures that the generated validators are given names like 'isValidUser', 'isValidProject' etc.`,
          type: 'string',
          demandOption: false,
          default: DEFAULT_RULES_TYPE_VALIDATOR_NAME_PATTERN,
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
        typeValidatorNamePattern,
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
          typeValidatorNamePattern,
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
    'generate-graph',
    'Generates a Mermaid graph for the specified schema and injects it into the specified file.',
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
          describe:
            'A marker that indicates the line after which the generated code should be inserted. Make sure to use a string that is unique within the file.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_GRAPH_START_MARKER,
        })
        .option('endMarker', {
          describe:
            'A marker that indicates the line before which the generated code should be inserted. Make sure to use a string that is unique within the file.',
          type: 'string',
          demandOption: false,
          default: DEFAULT_GRAPH_END_MARKER,
        })
        .option('orientation', {
          describe: `The orientation of the generated Mermaid graph. Can be either 'vertical' or 'horizontal' which correspond to the 'TB' and 'LR' Mermaid options, respectively.`,
          type: 'string',
          demandOption: false,
          choices: getSchemaGraphOrientations(),
          default: DEFAULT_GRAPH_ORIENTATION,
        })
        .option('debug', {
          describe: 'Whether to enable debug logs.',
          type: 'boolean',
          demandOption: false,
          default: DEFAULT_GRAPH_DEBUG,
        }),
    async args => {
      const { definition, outFile, startMarker, endMarker, orientation, debug } = args;

      const pathToOutputFile = resolve(process.cwd(), outFile);
      try {
        const result = await typesync.generateGraph({
          definition: resolve(process.cwd(), definition),
          outFile: pathToOutputFile,
          startMarker,
          endMarker,
          orientation,
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
          default: DEFAULT_VALIDATE_DEBUG,
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
