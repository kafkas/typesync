import { python } from '../../platforms/python/index.js';
import { schema } from '../../schema/index.js';
import { flatTypeToPython } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
import type { PythonDeclaration, PythonGeneration, PythonGenerator, PythonGeneratorConfig } from './_types.js';

class PythonGeneratorImpl implements PythonGenerator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public generate(s: schema.Schema): PythonGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;

    const declarations: PythonDeclaration[] = [];

    aliasModels.forEach(model => {
      if (model.type.type === 'object') {
        const pythonType: python.ObjectClass = {
          type: 'object-class',
          attributes: model.type.fields.map(f => ({
            name: f.name,
            type: flatTypeToPython(f.type),
            docs: f.docs,
            optional: f.optional,
          })),
        };
        declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
      } else if (model.type.type === 'enum') {
        const pythonType: python.EnumClass = {
          type: 'enum-class',
          attributes: model.type.items.map(item => ({ key: item.label, value: item.value })),
        };
        declarations.push({ type: 'enum-class', modelName: model.name, modelType: pythonType });
      } else {
        const pythonType = flatTypeToPython(model.type);
        declarations.push({ type: 'alias', modelName: model.name, modelType: pythonType });
      }
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered an 'object' type
      const pythonType: python.ObjectClass = {
        type: 'object-class',
        attributes: model.type.fields.map(f => ({
          name: f.name,
          type: flatTypeToPython(f.type),
          docs: f.docs,
          optional: f.optional,
        })),
      };
      declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
    });

    return { type: 'python', declarations };
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): PythonGenerator {
  return new PythonGeneratorImpl(config);
}
