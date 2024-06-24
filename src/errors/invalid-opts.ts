import type {
  GenerateGraphOption,
  GeneratePythonOption,
  GenerateRulesOption,
  GenerateSwiftOption,
  GenerateTsOption,
} from '../api/index.js';
import {
  RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM,
  RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM,
} from '../constants.js';

export class InvalidOptionsError extends Error {
  public constructor(message: string) {
    super(`The provided generation options are not valid. ${message}`);
  }
}

export class InvalidTSIndentationOptionError extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: GenerateTsOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidSwiftIndentationOptionError extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: GenerateSwiftOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidPyIndentationOptionError extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: GeneratePythonOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidRulesStartMarkerOptionError extends InvalidOptionsError {
  public constructor() {
    const option: GenerateRulesOption = 'startMarker';
    super(`Expected '${option}' to be a non-empty string.`);
  }
}

export class InvalidRulesEndMarkerOptionError extends InvalidOptionsError {
  public constructor() {
    const option: GenerateRulesOption = 'endMarker';
    super(`Expected '${option}' to be a non-empty string.`);
  }
}

export class RulesMarkerOptionsNotDistinctError extends InvalidOptionsError {
  public constructor(marker: string) {
    const startMarkerOpt: GenerateRulesOption = 'startMarker';
    const endMarkerOpt: GenerateRulesOption = 'endMarker';
    super(
      `Expected '${startMarkerOpt}' and '${endMarkerOpt}' to have different values. Received '${marker}' for both.`
    );
  }
}

export class InvalidRulesIndentationOptionError extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: GenerateRulesOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidGraphStartMarkerOptionError extends InvalidOptionsError {
  public constructor() {
    const option: GenerateGraphOption = 'startMarker';
    super(`Expected '${option}' to be a non-empty string.`);
  }
}

export class InvalidGraphEndMarkerOptionError extends InvalidOptionsError {
  public constructor() {
    const option: GenerateGraphOption = 'endMarker';
    super(`Expected '${option}' to be a non-empty string.`);
  }
}

export class GraphMarkerOptionsNotDistinctError extends InvalidOptionsError {
  public constructor(marker: string) {
    const startMarkerOpt: GenerateGraphOption = 'startMarker';
    const endMarkerOpt: GenerateGraphOption = 'endMarker';
    super(
      `Expected '${startMarkerOpt}' and '${endMarkerOpt}' to have different values. Received '${marker}' for both.`
    );
  }
}

export class InvalidCustomPydanticBaseOptionError extends InvalidOptionsError {
  public constructor(customPydanticBase: string) {
    const option: GeneratePythonOption = 'customPydanticBase';
    super(
      `Expected '${option}' to be a valid class import path with the format "x.y.z.CustomModel". Received "${customPydanticBase}" instead.`
    );
  }
}

export class InvalidUndefinedSentinelNameOptionError extends InvalidOptionsError {
  public constructor() {
    const option: GeneratePythonOption = 'undefinedSentinelName';
    super(`Expected '${option}' to be a non-empty string.`);
  }
}

export class InvalidTypeValidatorNamePatternOptionError extends InvalidOptionsError {
  public constructor(pattern: string) {
    const option: GenerateRulesOption = 'typeValidatorNamePattern';
    super(
      `Expected '${option}' to be a string that contains a '${RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM}' substring. Received '${pattern}'`
    );
  }
}

export class InvalidTypeValidatorParamNameOptionError extends InvalidOptionsError {
  public constructor(validatorParamName: string) {
    const option: GenerateRulesOption = 'typeValidatorParamName';
    super(`Expected '${option}' to be a non-empty string. Received '${validatorParamName}'`);
  }
}

export class InvalidReadonlyFieldValidatorNamePatternOptionError extends InvalidOptionsError {
  public constructor(pattern: string) {
    const option: GenerateRulesOption = 'readonlyFieldValidatorNamePattern';
    super(
      `Expected '${option}' to be a string that contains a '${RULES_READONLY_FIELD_VALIDATOR_NAME_PATTERN_PARAM}' substring. Received '${pattern}'`
    );
  }
}

export class InvalidReadonlyFieldValidatorPrevDataParamNameOptionError extends InvalidOptionsError {
  public constructor(validatorParamName: string) {
    const option: GenerateRulesOption = 'readonlyFieldValidatorPrevDataParamName';
    super(`Expected '${option}' to be a non-empty string. Received '${validatorParamName}'`);
  }
}

export class InvalidReadonlyFieldValidatorNextDataParamNameOptionError extends InvalidOptionsError {
  public constructor(validatorParamName: string) {
    const option: GenerateRulesOption = 'readonlyFieldValidatorNextDataParamName';
    super(`Expected '${option}' to be a non-empty string. Received '${validatorParamName}'`);
  }
}

export class ValidatorNamePatternsNotDistinctError extends InvalidOptionsError {
  public constructor(pattern: string) {
    const pattern1Opt: GenerateRulesOption = 'typeValidatorNamePattern';
    const pattern2Opt: GenerateRulesOption = 'readonlyFieldValidatorNamePattern';
    super(
      `Expected the values for '${pattern1Opt}' and '${pattern2Opt}' to be different. Received '${pattern}' for both.`
    );
  }
}
