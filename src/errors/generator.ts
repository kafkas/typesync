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
  /**
   * `sources` describes where each colliding name came from. Body fields are
   * cited by their Firestore key (the schema field name); the auto-generated
   * `@DocumentID` property is cited as the literal string `@DocumentID`.
   */
  public constructor(modelName: string, propertyName: string, sources: readonly string[]) {
    const involvesDocumentId = sources.includes('@DocumentID');
    const fieldSources = sources.filter(s => s !== '@DocumentID');
    const formattedSources = sources.map(n => (n === '@DocumentID' ? n : `'${n}'`)).join(', ');
    const remediation = involvesDocumentId
      ? `Either rename the auto-generated \`@DocumentID\` property by adding \`swift: { documentIdProperty: { name: '<unique-name>' } }\` to the document model, or rename the conflicting field${fieldSources.length > 1 ? 's' : ''} by setting \`swift: { name: '<unique-name>' }\` on ${fieldSources.length > 1 ? 'one of them' : 'it'}.`
      : `Disambiguate one of them by setting \`swift: { name: '<unique-name>' }\` on the field in your schema definition.`;
    const causeBlurb = involvesDocumentId
      ? `In the generated Swift struct, ${fieldSources.map(n => `field '${n}'`).join(' and ')} would have the same property name as the auto-generated \`@DocumentID\` property, which Swift does not allow. `
      : '';
    super(
      `Two or more properties on model '${modelName}' resolve to the same Swift property name '${propertyName}'. Conflicting source(s): ${formattedSources}. ${causeBlurb}${remediation}`
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
