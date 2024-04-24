import { python } from '../../platforms/python/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { flatTypeToPython } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
import type { FlatAliasModel, FlatDocumentModel, FlatObjectType, FlatType } from './_schema.js';
import type {
  PythonAliasDeclaration,
  PythonDeclaration,
  PythonEnumClassDeclaration,
  PythonGeneration,
  PythonGenerator,
  PythonGeneratorConfig,
  PythonPydanticClassDeclaration,
} from './_types.js';

class PythonGeneratorImpl implements PythonGenerator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public generate(s: schema.Schema): PythonGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;
    const declarations: PythonDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForFlatAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForFlatDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'python', declarations };
  }

  private createDeclarationForFlatAliasModel(model: FlatAliasModel): PythonDeclaration {
    switch (model.type.type) {
      case 'unknown':
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
      case 'discriminated-union':
      case 'simple-union':
      case 'alias':
        return this.createDeclarationForFlatType(model.type, model.name, model.docs);
      case 'enum':
        return this.createDeclarationForEnumType(model.type, model.name, model.docs);
      case 'object':
        return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
      default:
        assertNever(model.type);
    }
  }

  private createDeclarationForFlatDocumentModel(model: FlatDocumentModel): PythonDeclaration {
    // A Firestore document can be considered an 'object' type
    return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
  }

  private createDeclarationForEnumType(
    type: schema.types.Enum,
    modelName: string,
    modelDocs: string | undefined
  ): PythonEnumClassDeclaration {
    const pythonType: python.EnumClass = {
      type: 'enum-class',
      attributes: type.members.map(item => ({
        key: item.label,
        value: item.value,
      })),
    };
    return {
      type: 'enum-class',
      modelName,
      modelType: pythonType,
      modelDocs,
    };
  }

  private createDeclarationForFlatObjectType(
    type: FlatObjectType,
    modelName: string,
    modelDocs: string | undefined
  ): PythonPydanticClassDeclaration {
    const pythonType: python.ObjectClass = {
      type: 'object-class',
      attributes: type.fields.map(f => ({
        name: f.name,
        type: flatTypeToPython(f.type),
        docs: f.docs,
        optional: f.optional,
      })),
    };
    return {
      type: 'pydantic-class',
      modelName,
      modelType: pythonType,
      modelDocs,
    };
  }

  private createDeclarationForFlatType(
    type: FlatType,
    modelName: string,
    modelDocs: string | undefined
  ): PythonAliasDeclaration {
    const pythonType = flatTypeToPython(type);
    return {
      type: 'alias',
      modelName,
      modelType: pythonType,
      modelDocs,
    };
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): PythonGenerator {
  return new PythonGeneratorImpl(config);
}
