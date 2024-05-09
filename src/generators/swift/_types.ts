import type { SwiftGenerationTarget } from '../../api/index.js';
import type { swift } from '../../platforms/swift/index.js';
import type { Schema } from '../../schema-new/index.js';

export interface SwiftTypealiasDeclaration {
  type: 'typealias';
  modelName: string;
  modelType: swift.Type;
  modelDocs: string | null;
}

export interface SwiftStringEnumDeclaration {
  type: 'string-enum';
  modelName: string;
  modelType: swift.StringEnum;
  modelDocs: string | null;
}

export interface SwiftIntEnumDeclaration {
  type: 'int-enum';
  modelName: string;
  modelType: swift.IntEnum;
  modelDocs: string | null;
}

export interface SwiftDiscriminatedUnionEnumDeclaration {
  type: 'discriminated-union-enum';
  modelName: string;
  modelType: swift.DiscriminatedUnionEnum;
  modelDocs: string | null;
}

export interface SwiftSimpleUnionEnumDeclaration {
  type: 'simple-union-enum';
  modelName: string;
  modelType: swift.SimpleUnionEnum;
  modelDocs: string | null;
}

export interface SwiftStructDeclaration {
  type: 'struct';
  modelName: string;
  modelType: swift.Struct;
  modelDocs: string | null;
}

export type SwiftDeclaration =
  | SwiftTypealiasDeclaration
  | SwiftStringEnumDeclaration
  | SwiftIntEnumDeclaration
  | SwiftDiscriminatedUnionEnumDeclaration
  | SwiftSimpleUnionEnumDeclaration
  | SwiftStructDeclaration;

export interface SwiftGeneration {
  type: 'swift';
  declarations: SwiftDeclaration[];
}

export interface SwiftGeneratorConfig {
  target: SwiftGenerationTarget;
}

export interface SwiftGenerator {
  generate(s: Schema): SwiftGeneration;
}
