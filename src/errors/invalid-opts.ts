import { TypesyncGenerateOption, TypesyncGenerateRulesOption } from '../api.js';

export class InvalidOptionsError extends Error {
  public constructor(message: string) {
    super(`The provided generation options are not valid: ${message}`);
  }
}

export class InvalidIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    const option: TypesyncGenerateOption = 'indentation';
    super(`Expected '${option}' to be a positive integer. Received ${indentation}`);
  }
}

export class InvalidCustomPydanticBaseOption extends InvalidOptionsError {
  public constructor(customPydanticBase: string) {
    const option: TypesyncGenerateOption = 'customPydanticBase';
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
