import type {
  TypesyncGeneratePyOption,
  TypesyncGenerateRulesOption,
  TypesyncGenerateSwiftOption,
  TypesyncGenerateTsOption,
} from '../api.js';

export class InvalidOptionsError extends Error {
  public constructor(message: string) {
    super(`The provided generation options are not valid: ${message}`);
  }
}

export class InvalidTSIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: TypesyncGenerateTsOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidSwiftIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: TypesyncGenerateSwiftOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidPyIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: TypesyncGeneratePyOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidRulesIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: TypesyncGenerateRulesOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidCustomPydanticBaseOption extends InvalidOptionsError {
  public constructor(customPydanticBase: string) {
    const option: TypesyncGeneratePyOption = 'customPydanticBase';
    super(
      `Expected '${option}' to be a valid class import path with the format "x.y.z.CustomModel". Received "${customPydanticBase}" instead.`
    );
  }
}

export class InvalidValidatorNamePatternOption extends InvalidOptionsError {
  public constructor(validatorNamePattern: string) {
    const option: TypesyncGenerateRulesOption = 'validatorNamePattern';
    super(
      `Expected '${option}' to be a string that contains a '{modelName}' substring. Received '${validatorNamePattern}'`
    );
  }
}

export class InvalidValidatorParamNameOption extends InvalidOptionsError {
  public constructor(validatorParamName: string) {
    const option: TypesyncGenerateRulesOption = 'validatorParamName';
    super(`Expected '${option}' to be a non-empty string. Received '${validatorParamName}'`);
  }
}
