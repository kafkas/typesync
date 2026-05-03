import {
  MixedEnumValueTypesNotSupportedError,
  SwiftDocumentIdPropertyCollidesWithFieldError,
  SwiftPropertyNameCollisionError,
} from '../../errors/generator.js';
import { swift } from '../../platforms/swift/index.js';
import { schema } from '../../schema/index.js';
import { assert, assertNever } from '../../util/assert.js';
import { camelCase } from '../../util/casing.js';
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

const DEFAULT_DOCUMENT_ID_PROPERTY_NAME = 'id';

function resolveSwiftPropertyName(field: schema.swift.types.ObjectField): string {
  return field.platformOptions?.swift?.name ?? camelCase(field.name);
}

class SwiftGeneratorImpl implements SwiftGenerator {
  public constructor(private readonly config: SwiftGeneratorConfig) {}

  public generate(s: schema.Schema): SwiftGeneration {
    const adjustedSchema = adjustSchemaForSwift(s);
    const { aliasModels, documentModels } = adjustedSchema;
    const declarations: SwiftDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForAliasModel(model, adjustedSchema);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'swift', declarations };
  }

  private buildDocumentIdProperty(model: schema.swift.DocumentModel): swift.DocumentIdProperty {
    const overrideName = model.platformOptions?.swift?.documentIdProperty?.name;
    return { name: overrideName ?? DEFAULT_DOCUMENT_ID_PROPERTY_NAME };
  }

  private createDeclarationForAliasModel(model: schema.swift.AliasModel, s: schema.swift.Schema): SwiftDeclaration {
    switch (model.type.type) {
      case 'any':
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

  private createDeclarationForDocumentModel(model: schema.swift.DocumentModel): SwiftDeclaration {
    return this.createDeclarationForFlatObjectType(
      model.type,
      model.name,
      model.docs,
      this.buildDocumentIdProperty(model)
    );
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
    type: schema.swift.types.Object,
    modelName: string,
    modelDocs: string | null,
    documentIdProperty: swift.DocumentIdProperty | null = null
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
          name: camelCase(field.name),
          docs: field.docs,
          type: literalTypeToSwift(field.type),
          literalValue: `${typeof field.type.value === 'string' ? `"${field.type.value}"` : field.type.value}`,
        });
      } else {
        regularProperties.push({
          originalName: field.name,
          name: resolveSwiftPropertyName(field),
          docs: field.docs,
          optional: field.optional,
          type: flatTypeToSwift(field.type),
        });
      }
    });

    if (documentIdProperty !== null) {
      this.assertNoDocumentIdCollision({ modelName, documentIdProperty, literalProperties, regularProperties });
    }
    this.assertUniquePropertyNames({ modelName, documentIdProperty, literalProperties, regularProperties });

    const swiftType: swift.Struct = {
      type: 'struct',
      documentIdProperty,
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

  private assertNoDocumentIdCollision(args: {
    modelName: string;
    documentIdProperty: swift.DocumentIdProperty;
    literalProperties: readonly swift.LiteralStructProperty[];
    regularProperties: readonly swift.RegularStructProperty[];
  }): void {
    const { modelName, documentIdProperty, literalProperties, regularProperties } = args;
    const allBodyProperties = [...literalProperties, ...regularProperties];
    // The Firebase iOS SDK throws on decode when the @DocumentID property
    // name matches any wire key in the document body. Renaming the body
    // field's Swift binding (`swift.name`) does not help because the wire
    // key is what the SDK compares against, so we have to detect this on
    // `originalName` (Firestore key), not on the resolved Swift name.
    const conflict = allBodyProperties.find(p => p.originalName === documentIdProperty.name);
    if (conflict !== undefined) {
      throw new SwiftDocumentIdPropertyCollidesWithFieldError(
        modelName,
        conflict.originalName,
        documentIdProperty.name
      );
    }
  }

  private assertUniquePropertyNames(args: {
    modelName: string;
    documentIdProperty: swift.DocumentIdProperty | null;
    literalProperties: readonly swift.LiteralStructProperty[];
    regularProperties: readonly swift.RegularStructProperty[];
  }): void {
    const { modelName, literalProperties, regularProperties } = args;
    const allBodyProperties = [...literalProperties, ...regularProperties];
    const byName = new Map<string, string[]>();
    allBodyProperties.forEach(p => {
      const existing = byName.get(p.name) ?? [];
      existing.push(p.originalName);
      byName.set(p.name, existing);
    });
    for (const [name, originalNames] of byName) {
      if (originalNames.length > 1) {
        throw new SwiftPropertyNameCollisionError(modelName, name, originalNames);
      }
    }
  }

  private createDeclarationForFlatDiscriminatedUnionType(
    type: schema.swift.types.DiscriminatedUnion,
    modelName: string,
    modelDocs: string | null,
    s: schema.swift.Schema
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
    type: schema.swift.types.SimpleUnion,
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
    type: schema.swift.types.Type,
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
