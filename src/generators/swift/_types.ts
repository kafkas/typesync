import type { SwiftGenerationPlatform } from '../../api.js';
import type { swift } from '../../platforms/swift/index.js';
import type { schema } from '../../schema/index.js';

export interface SwiftTypealiasDeclaration {
  type: 'typealias';
  modelName: string;
  modelType: swift.Type;
  modelDocs: string | undefined;
}

export interface SwiftStringEnumDeclaration {
  type: 'string-enum';
  modelName: string;
  modelType: swift.StringEnum;
  modelDocs: string | undefined;
}

export interface SwiftIntEnumDeclaration {
  type: 'int-enum';
  modelName: string;
  modelType: swift.IntEnum;
  modelDocs: string | undefined;
}

export interface SwiftStructDeclaration {
  type: 'struct';
  modelName: string;
  modelType: swift.Struct;
  modelDocs: string | undefined;
}

export type SwiftDeclaration =
  | SwiftTypealiasDeclaration
  | SwiftStringEnumDeclaration
  | SwiftIntEnumDeclaration
  | SwiftStructDeclaration;

export interface SwiftGeneration {
  type: 'swift';
  declarations: SwiftDeclaration[];
}

export interface SwiftGeneratorConfig {
  platform: SwiftGenerationPlatform;
}

export interface SwiftGenerator {
  generate(s: schema.Schema): SwiftGeneration;
}
