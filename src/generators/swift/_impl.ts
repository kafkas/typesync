import { swift } from '../../platforms/swift/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { flatTypeToSwift } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
import {
  FlatAliasModel,
  FlatDiscriminatedUnionType,
  FlatDocumentModel,
  FlatObjectType,
  FlatSimpleUnionType,
  FlatType,
} from './_schema.js';
import type {
  SwiftDeclaration,
  SwiftEnumWithAssociatedValuesDeclaration,
  SwiftGeneration,
  SwiftGenerator,
  SwiftGeneratorConfig,
  SwiftIntEnumDeclaration,
  SwiftStringEnumDeclaration,
  SwiftStructDeclaration,
  SwiftTypealiasDeclaration,
} from './_types.js';

class SwiftGeneratorImpl implements SwiftGenerator {
  public constructor(private readonly config: SwiftGeneratorConfig) {}

  public generate(s: schema.Schema): SwiftGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;
    const declarations: SwiftDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForFlatAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForFlatDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'swift', declarations };
  }

  private createDeclarationForFlatAliasModel(model: FlatAliasModel): SwiftDeclaration {
    switch (model.type.type) {
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'literal':
      case 'tuple':
      case 'list':
      case 'map':
      case 'alias':
        return this.createDeclarationForFlatType(model.type, model.name, model.docs);
      case 'enum':
        return this.createDeclarationForEnumType(model.type, model.name, model.docs);
      case 'object':
        return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
      case 'discriminated-union':
        return this.createDeclarationForFlatDiscriminatedUnionType(model.type, model.name, model.docs);
      case 'simple-union':
        return this.createDeclarationForFlatSimpleUnionType(model.type, model.name, model.docs);
      default:
        assertNever(model.type);
    }
  }

  private createDeclarationForFlatDocumentModel(model: FlatDocumentModel): SwiftDeclaration {
    // A Firestore document can be considered an 'object' type
    return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
  }

  private createDeclarationForEnumType(
    _type: schema.types.Enum,
    _modelName: string,
    _modelDocs: string | undefined
  ): SwiftStringEnumDeclaration | SwiftIntEnumDeclaration {
    // TODO: Implement
    throw new Error('Unimplemented');
  }

  private createDeclarationForFlatObjectType(
    type: FlatObjectType,
    modelName: string,
    modelDocs: string | undefined
  ): SwiftStructDeclaration {
    const swiftType: swift.Struct = {
      type: 'struct',
      properties: type.fields.map(f => ({
        name: f.name,
        type: flatTypeToSwift(f.type),
        docs: f.docs,
        optional: f.optional,
      })),
    };
    return {
      type: 'struct',
      modelName,
      modelType: swiftType,
      modelDocs,
    };
  }

  private createDeclarationForFlatDiscriminatedUnionType(
    _type: FlatDiscriminatedUnionType,
    _modelName: string,
    _modelDocs: string | undefined
  ): SwiftEnumWithAssociatedValuesDeclaration {
    // TODO: Implement
    throw new Error('Unimplemented');
  }

  private createDeclarationForFlatSimpleUnionType(
    _type: FlatSimpleUnionType,
    _modelName: string,
    _modelDocs: string | undefined
  ): SwiftEnumWithAssociatedValuesDeclaration {
    // TODO: Implement
    throw new Error('Unimplemented');
  }

  private createDeclarationForFlatType(
    type: FlatType,
    modelName: string,
    modelDocs: string | undefined
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
