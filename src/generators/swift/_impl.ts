import { MixedEnumValueTypesNotSupportedError } from '../../errors/generator.js';
import { swift } from '../../platforms/swift/index.js';
import { Schema, schema } from '../../schema/index.js';
import { assert, assertNever } from '../../util/assert.js';
import { extractDiscriminantValue } from '../../util/extract-discriminant-value.js';
import { adjustSchemaForSwift } from './_adjust-schema.js';
import { flatTypeToSwift, literalTypeToSwift } from './_converters.js';
import type {
  SwiftDeclaration,
  SwiftDiscriminatedUnionEnumDeclaration,
  SwiftGeneration,
  SwiftGenerator,
  SwiftGeneratorConfig,
  SwiftIntEnumDeclaration,
  SwiftSimpleUnionEnumDeclaration,
  SwiftStringEnumDeclaration,
  SwiftStructDeclaration,
  SwiftTypealiasDeclaration,
} from './_types.js';

class SwiftGeneratorImpl implements SwiftGenerator {
  public constructor(private readonly config: SwiftGeneratorConfig) {}

  public generate(s: Schema): SwiftGeneration {
    const adjustedSchema = adjustSchemaForSwift(s);
    const { aliasModels, documentModels } = adjustedSchema;
    const declarations: SwiftDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForFlatAliasModel(model, adjustedSchema);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForFlatDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'swift', declarations };
  }

  private createDeclarationForFlatAliasModel(model: swift.schema.AliasModel, s: swift.schema.Schema): SwiftDeclaration {
    switch (model.type.type) {
      case 'unknown':
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'string-literal':
      case 'int-literal':
      case 'boolean-literal':
      case 'tuple':
      case 'list':
      case 'map':
      case 'alias':
        return this.createDeclarationForFlatType(model.type, model.name, model.docs);
      case 'string-enum':
      case 'int-enum':
        return this.createDeclarationForEnumType(model.type, model.name, model.docs);
      case 'object':
        return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
      case 'discriminated-union':
        return this.createDeclarationForFlatDiscriminatedUnionType(model.type, model.name, model.docs, s);
      case 'simple-union':
        return this.createDeclarationForFlatSimpleUnionType(model.type, model.name, model.docs);
      default:
        assertNever(model.type);
    }
  }

  private createDeclarationForFlatDocumentModel(model: swift.schema.DocumentModel): SwiftDeclaration {
    // A Firestore document can be considered an 'object' type
    return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
  }

  private createDeclarationForEnumType(
    type: schema.types.Enum,
    modelName: string,
    modelDocs: string | null
  ): SwiftStringEnumDeclaration | SwiftIntEnumDeclaration {
    const isStringEnum = type.members.every(member => typeof member.value === 'string');
    if (isStringEnum) {
      const swiftType: swift.StringEnum = {
        type: 'string-enum',
        cases: type.members.map(member => ({
          key: member.label,
          value: member.value as string,
        })),
      };
      return {
        type: 'string-enum',
        modelType: swiftType,
        modelName,
        modelDocs,
      };
    }

    const isIntEnum = type.members.every(member => typeof member.value === 'number');
    if (isIntEnum) {
      const swiftType: swift.IntEnum = {
        type: 'int-enum',
        cases: type.members.map(member => ({
          key: member.label,
          value: member.value as number,
        })),
      };
      return {
        type: 'int-enum',
        modelType: swiftType,
        modelName,
        modelDocs,
      };
    }

    throw new MixedEnumValueTypesNotSupportedError(modelName);
  }

  private createDeclarationForFlatObjectType(
    type: swift.schema.types.Object,
    modelName: string,
    modelDocs: string | null
  ): SwiftStructDeclaration {
    const literalProperties: swift.LiteralStructProperty[] = [];
    const regularProperties: swift.RegularStructProperty[] = [];

    type.fields.forEach(field => {
      if (
        (field.type.type === 'string-literal' ||
          field.type.type === 'int-literal' ||
          field.type.type === 'boolean-literal') &&
        !field.optional
      ) {
        literalProperties.push({
          originalName: field.name,
          docs: field.docs,
          type: literalTypeToSwift(field.type),
          literalValue: `${typeof field.type.value === 'string' ? `"${field.type.value}"` : field.type.value}`,
        });
      } else {
        regularProperties.push({
          originalName: field.name,
          docs: field.docs,
          optional: field.optional,
          type: flatTypeToSwift(field.type),
        });
      }
    });

    const swiftType: swift.Struct = {
      type: 'struct',
      literalProperties,
      regularProperties,
    };

    return {
      type: 'struct',
      modelName,
      modelType: swiftType,
      modelDocs,
    };
  }

  private createDeclarationForFlatDiscriminatedUnionType(
    type: swift.schema.types.DiscriminatedUnion,
    modelName: string,
    modelDocs: string | null,
    s: swift.schema.Schema
  ): SwiftDiscriminatedUnionEnumDeclaration {
    const swiftType: swift.DiscriminatedUnionEnum = {
      type: 'discriminated-union-enum',
      discriminant: type.discriminant,
      values: type.variants.map(vt => {
        const model = s.getAliasModel(vt.name);
        assert(model?.type.type === 'object');
        const discriminantValue = extractDiscriminantValue(type, model.type);
        return {
          structName: vt.name,
          discriminantValue,
        };
      }),
    };
    return {
      type: 'discriminated-union-enum',
      modelName,
      modelType: swiftType,
      modelDocs,
    };
  }

  private createDeclarationForFlatSimpleUnionType(
    type: swift.schema.types.SimpleUnion,
    modelName: string,
    modelDocs: string | null
  ): SwiftSimpleUnionEnumDeclaration {
    const swiftType: swift.SimpleUnionEnum = {
      type: 'simple-union-enum',
      values: type.variants.map(vt => ({
        type: flatTypeToSwift(vt),
      })),
    };
    return {
      type: 'simple-union-enum',
      modelName,
      modelType: swiftType,
      modelDocs,
    };
  }

  private createDeclarationForFlatType(
    type: swift.schema.types.Type,
    modelName: string,
    modelDocs: string | null
  ): SwiftTypealiasDeclaration {
    const swiftType = flatTypeToSwift(type);
    return {
      type: 'typealias',
      modelName,
      modelType: swiftType,
      modelDocs,
    };
  }
}

export function createSwiftGenerator(config: SwiftGeneratorConfig): SwiftGenerator {
  return new SwiftGeneratorImpl(config);
}
