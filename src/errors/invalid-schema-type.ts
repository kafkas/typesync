import { ordinalSuffixOf } from '../util/ordinal-suffix.js';

export class InvalidSchemaTypeError extends Error {
  public constructor(message: string) {
    super(`The schema type is invalid. ${message}`);
  }
}

export class NoEnumMembersError extends InvalidSchemaTypeError {
  public constructor() {
    super(`An 'enum' type must have at least one member.`);
  }
}

export class DuplicateEnumMemberLabelError extends InvalidSchemaTypeError {
  public constructor(label: string) {
    super(
      `The enum member label "${label}" has been used more than once. Each enum member must have a distinct label.`
    );
  }
}

export class DuplicateEnumMemberValueError extends InvalidSchemaTypeError {
  public constructor(value: string | number) {
    super(
      `The enum member value ${typeof value === 'string' ? `"${value}"` : value} has been used more than once. Each enum member must have a distinct value.`
    );
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
    super(`The discriminant field of ${variantIdentifier} must be a non-optional string 'literal' type.`);
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
