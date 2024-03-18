import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { flatTypeToPython } from './_converters';
import { flattenSchema } from './_flatten-schema';
import type { PythonDeclaration, PythonGeneration, PythonGenerator, PythonGeneratorConfig } from './_types';

class PythonGeneratorImpl implements PythonGenerator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public generate(s: schema.Schema): PythonGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;

    const declarations: PythonDeclaration[] = [];

    aliasModels.forEach(model => {
      if (model.value.type === 'object') {
        const pythonType: python.ObjectClass = {
          type: 'object-class',
          attributes: model.value.fields.map(f => ({
            name: f.name,
            type: flatTypeToPython(f.type),
            docs: f.docs,
            optional: f.optional,
          })),
        };
        declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
      } else if (model.value.type === 'enum') {
        const pythonType: python.EnumClass = {
          type: 'enum-class',
          attributes: model.value.items.map(item => ({ key: item.label, value: item.value })),
        };
        declarations.push({ type: 'enum-class', modelName: model.name, modelType: pythonType });
      } else {
        const pythonType = flatTypeToPython(model.value);
        declarations.push({ type: 'alias', modelName: model.name, modelType: pythonType });
      }
    });

    documentModels.forEach(model => {
      // A Firestore document can be considered an 'object' type
      const pythonType: python.ObjectClass = {
        type: 'object-class',
        attributes: model.fields.map(f => ({
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
