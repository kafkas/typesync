import type { generation } from '../../generation';
import type { PythonGenerator, PythonGeneratorConfig } from '../../interfaces';
import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { flattenSchema } from '../../util/flatten-schema';

class PythonGeneratorImpl implements PythonGenerator {
  public constructor(private readonly config: PythonGeneratorConfig) {}

  public generate(s: schema.Schema): generation.PythonGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;

    const declarations: generation.PythonDeclaration[] = [];

    aliasModels.forEach(model => {
      // TODO: Implement
      const pythonType: python.Alias = { type: 'alias', name: 'Placeholder' };
      declarations.push({ type: 'alias', modelName: model.name, modelType: pythonType });
    });

    documentModels.forEach(model => {
      // TODO: Implement
      const pythonType: python.Alias = { type: 'alias', name: 'Placeholder' };
      declarations.push({ type: 'pydantic-class', modelName: model.name, modelType: pythonType });
    });

    return { type: 'python', declarations };
  }
}

export function createPythonGenerator(config: PythonGeneratorConfig): PythonGenerator {
  return new PythonGeneratorImpl(config);
}
