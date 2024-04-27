import { TypesyncGenerateOption } from '../api.js';

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
