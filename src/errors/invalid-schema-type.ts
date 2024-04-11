import { ordinalSuffixOf } from '../util/ordinal-suffix.js';

export class InvalidSchemaTypeError extends Error {
  public constructor(message: string) {
    super(`The schema type is not valid. ${message}`);
  }
}

export class MissingDiscriminantFieldError extends InvalidSchemaTypeError {
  public constructor(discriminant: string, variantIdxOrAliasName: number | string) {
    const variantIdentifier =
      typeof variantIdxOrAliasName === 'number'
        ? `The ${ordinalSuffixOf(variantIdxOrAliasName + 1)} discriminated union variant`
        : `The variant '${variantIdxOrAliasName}'`;
    super(`${variantIdentifier} does not contain a field matching the discriminant '${discriminant}'.`);
  }
}

export class InvalidDiscriminantFieldError extends InvalidSchemaTypeError {
  public constructor(variantIdxOrAliasName: number | string) {
    const variantIdentifier =
      typeof variantIdxOrAliasName === 'number'
        ? `the ${ordinalSuffixOf(variantIdxOrAliasName + 1)} discriminated union variant`
        : `the variant '${variantIdxOrAliasName}'`;
    super(`The discriminant field of ${variantIdentifier} must be a string 'literal' type.`);
  }
}

export class MissingDiscriminatedUnionAliasVariantError extends InvalidSchemaTypeError {
  public constructor(variantAliasName: string) {
    super(`The variant '${variantAliasName}' does not exist in the schema as a model.`);
  }
}

export class InvalidDiscriminatedUnionAliasVariantError extends InvalidSchemaTypeError {
  public constructor(variantAliasName: string) {
    super(`The variant '${variantAliasName}' must be an 'object' type.`);
  }
}
