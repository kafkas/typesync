export class SwiftGeneratorError extends Error {
  public constructor(message: string) {
    super(`The Swift generator encountered an error. ${message}`);
  }
}

export class MixedEnumValueTypesNotSupportedError extends SwiftGeneratorError {
  public constructor(modelName: string) {
    super(
      `The model '${modelName}' is represented by an enum with mixed value types, which is not supported in Swift. Swift enums must have either String or Int raw values, not both.`
    );
  }
}
