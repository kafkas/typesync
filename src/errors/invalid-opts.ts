export class InvalidOptionsError extends Error {
  public constructor(message: string) {
    super(`The provided generation options are not valid: ${message}`);
  }
}

export class InvalidIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    super(`Expected 'indentation' to be a positive integer. Received ${indentation}`);
  }
}
