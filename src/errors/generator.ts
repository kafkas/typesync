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

export class SwiftPropertyNameCollisionError extends SwiftGeneratorError {
  public constructor(modelName: string, propertyName: string, originalNames: readonly string[]) {
    super(
      `Two or more fields on document model '${modelName}' resolve to the same Swift property name '${propertyName}'. Conflicting source field(s): ${originalNames
        .map(n => `'${n}'`)
        .join(
          ', '
        )}. Disambiguate one of them by setting \`swift: { name: '<unique-name>' }\` on the field in your schema definition.`
    );
  }
}

export class SwiftDocumentIdPropertyCollidesWithFieldError extends SwiftGeneratorError {
  public constructor(modelName: string, fieldName: string, documentIdPropertyName: string) {
    super(
      `Document model '${modelName}' declares a body field named '${fieldName}', whose Firestore key matches the auto-generated \`@DocumentID\` property name '${documentIdPropertyName}'. The Firebase iOS SDK refuses to decode such documents because the path-derived id and the body field would clash on the same wire key. Rename the \`@DocumentID\` property by adding \`swift: { documentIdProperty: { name: '<unique-name>' } }\` to the document model in your schema definition (e.g. \`name: 'documentId'\`). The body field then keeps its current Firestore key and Swift name.`
    );
  }
}
