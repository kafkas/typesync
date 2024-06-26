import { python } from '../../platforms/python/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { adjustSchemaForPython } from './_adjust-schema.js';
import { flatTypeToPython } from './_converters.js';
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
    const adjustedSchema = adjustSchemaForPython(s);
    const { aliasModels, documentModels } = adjustedSchema;
    const declarations: PythonDeclaration[] = [];
    aliasModels.forEach(model => {
      const d = this.createDeclarationForAliasModel(model);
      declarations.push(d);
    });
    documentModels.forEach(model => {
      const d = this.createDeclarationForDocumentModel(model);
      declarations.push(d);
    });
    return { type: 'python', declarations };
  }

  private createDeclarationForAliasModel(model: schema.python.AliasModel): PythonDeclaration {
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
      case 'discriminated-union':
      case 'simple-union':
      case 'alias':
        return this.createDeclarationForFlatType(model.type, model.name, model.docs);
      case 'string-enum':
      case 'int-enum':
        return this.createDeclarationForEnumType(model.type, model.name, model.docs);
      case 'object':
        return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
      default:
        assertNever(model.type);
    }
  }

  private createDeclarationForDocumentModel(model: schema.python.DocumentModel): PythonDeclaration {
    // A Firestore document can be considered an 'object' type
    return this.createDeclarationForFlatObjectType(model.type, model.name, model.docs);
  }

  private createDeclarationForEnumType(
    type: schema.python.types.Enum,
    modelName: string,
    modelDocs: string | null
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
    type: schema.python.types.Object,
    modelName: string,
    modelDocs: string | null
  ): PythonPydanticClassDeclaration {
    const pythonType: python.ObjectClass = {
      type: 'object-class',
      attributes: type.fields.map(f => ({
        name: f.name,
        type: flatTypeToPython(f.type),
        docs: f.docs,
        optional: f.optional,
      })),
      additionalAttributes: type.additionalFields,
    };
    return {
      type: 'pydantic-class',
      modelName,
      modelType: pythonType,
      modelDocs,
    };
  }

  private createDeclarationForFlatType(
    type: schema.python.types.Type,
    modelName: string,
    modelDocs: string | null
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
