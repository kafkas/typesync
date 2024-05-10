export class RulesRendererError extends Error {
  public constructor(message: string) {
    super(`The Rules renderer encountered an error. ${message}`);
  }
}

export class InvalidOutputFileError extends Error {
  public constructor(pathToOutputFile: string, message: string) {
    super(`The output file '${pathToOutputFile}' is not valid. ${message}`);
  }
}

export class MissingRulesOutputFileError extends Error {
  public constructor(pathToOutputFile: string) {
    super(
      `The output file '${pathToOutputFile}' does not exist. An existing output file is required for Security Rules generation since it contains the markers between which the generated code is inserted.`
    );
  }
}

export class MissingStartMarkerError extends InvalidOutputFileError {
  public constructor(pathToOutputFile: string, startMarker: string) {
    super(pathToOutputFile, `The start marker '${startMarker}' is missing from the output file.`);
  }
}

export class MissingEndMarkerError extends InvalidOutputFileError {
  public constructor(pathToOutputFile: string, endMarker: string) {
    super(pathToOutputFile, `The end marker '${endMarker}' is missing from the output file.`);
  }
}

export class MisplacedStartMarkerError extends InvalidOutputFileError {
  public constructor(pathToOutputFile: string, startMarker: string, endMarker: string) {
    super(
      pathToOutputFile,
      `The start marker '${startMarker}' must be placed before the end marker '${endMarker}' in the output file.`
    );
  }
}
