import type { SwiftGenerationPlatform } from '../../api.js';
import type { SwiftGeneration } from '../../generators/swift/index.js';
import type { RenderedFile } from '../_types.js';

export interface SwiftRendererConfig {
  platform: SwiftGenerationPlatform;
  indentation: number;
}

export interface SwiftRenderer {
  render(g: SwiftGeneration): Promise<RenderedFile>;
}
