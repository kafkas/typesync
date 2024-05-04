import type { SwiftGenerationTarget } from '../../api/index.js';
import type { SwiftGeneration } from '../../generators/swift/index.js';
import type { RenderedFile } from '../_types.js';

export interface SwiftRendererConfig {
  target: SwiftGenerationTarget;
  indentation: number;
}

export interface SwiftRenderer {
  render(g: SwiftGeneration): Promise<RenderedFile>;
}
