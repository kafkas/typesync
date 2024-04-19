import { swift } from '../../platforms/swift/index.js';
import { schema } from '../../schema/index.js';
import { flatTypeToSwift } from './_converters.js';
import { flattenSchema } from './_flatten-schema.js';
import type { SwiftDeclaration, SwiftGeneration, SwiftGenerator, SwiftGeneratorConfig } from './_types.js';

class SwiftGeneratorImpl implements SwiftGenerator {
  public constructor(private readonly config: SwiftGeneratorConfig) {}

  public generate(s: schema.Schema): SwiftGeneration {
    const flattenedSchema = flattenSchema(s);
    const { aliasModels, documentModels } = flattenedSchema;

    const declarations: SwiftDeclaration[] = [];

    documentModels.forEach(model => {
      // A Firestore document can be considered a 'struct' type
      const swiftType: swift.Struct = {
        type: 'struct',
        properties: model.type.fields.map(f => ({
          name: f.name,
          type: flatTypeToSwift(f.type),
          docs: f.docs,
          optional: f.optional,
        })),
      };
      declarations.push({
        type: 'struct',
        modelName: model.name,
        modelType: swiftType,
        modelDocs: model.docs,
      });
    });

    return { type: 'swift', declarations };
  }
}

export function createSwiftGenerator(config: SwiftGeneratorConfig): SwiftGenerator {
  return new SwiftGeneratorImpl(config);
}
