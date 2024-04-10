import { ordinalSuffixOf } from '../util/ordinal-suffix.js';

export class InvalidSchemaError extends Error {
  public constructor(message: string) {
    super(`The schema is not valid. ${message}`);
  }
}

export class MissingDiscriminantFieldError extends InvalidSchemaError {
  public constructor(modelName: string, discriminant: string, variantIdxOrAliasName: number | string) {
    const variantIdentifier =
      typeof variantIdxOrAliasName === 'number'
        ? `The ${ordinalSuffixOf(variantIdxOrAliasName + 1)} discriminated union variant`
        : `The variant '${variantIdxOrAliasName}'`;
    super(
      `${variantIdentifier} of '${modelName}' does not contain a field matching the discriminant '${discriminant}'.`
    );
  }
}

export class InvalidDiscriminantFieldError extends InvalidSchemaError {
  public constructor(modelName: string, variantIdxOrAliasName: number | string) {
    const variantIdentifier =
      typeof variantIdxOrAliasName === 'number'
        ? `the ${ordinalSuffixOf(variantIdxOrAliasName + 1)} discriminated union variant`
        : `the variant '${variantIdxOrAliasName}'`;
    super(`The discriminant field of ${variantIdentifier} of '${modelName}' must be a string 'literal' type.`);
  }
}

export class MissingDiscriminatedUnionAliasVariantError extends InvalidSchemaError {
  public constructor(modelName: string, variantAliasName: string) {
    super(`The variant '${variantAliasName}' for the discriminated union '${modelName}' does not exist as a model.`);
  }
}

export class InvalidDiscriminatedUnionAliasVariantError extends InvalidSchemaError {
  public constructor(modelName: string, variantAliasName: string) {
    super(`The variant '${variantAliasName}' for the discriminated union '${modelName}' must be an 'object' type.`);
  }
}
