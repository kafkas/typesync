export class InvalidOptionsError extends Error {
  public constructor(message: string) {
    super(`The provided generation options are not valid: ${message}`);
  }
}

export class InvalidOutputDirOption extends InvalidOptionsError {
  public constructor(pathToOutputDir: string) {
    super(
      `${pathToOutputDir} is not an available output directory. The output directory must be an empty directory that does or does not exist.`
    );
  }
}

export class InvalidIndentationOption extends InvalidOptionsError {
  public constructor(indentation: number) {
    super(`Expected 'indentation' to be a positive integer. Received ${indentation}`);
  }
}
