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
        // TODO: Implement
        const pythonType: python.ObjectClass = { type: 'object-class' };
        declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
      } else if (model.value.type === 'enum') {
        const pythonType: python.EnumClass = { type: 'enum-class', items: model.value.items };
        declarations.push({ type: 'enum-class', modelName: model.name, modelType: pythonType });
      } else {
        const pythonType = flatTypeToPython(model.value);
        declarations.push({ type: 'alias', modelName: model.name, modelType: pythonType });
      }
    });

    documentModels.forEach(model => {
      // TODO: Implement
      const pythonType: python.ObjectClass = { type: 'object-class' };
      declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
    });

    return { type: 'python', declarations };
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): PythonGenerator {
  return new PythonGeneratorImpl(config);
}
